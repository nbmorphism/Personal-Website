#!/usr/bin/env python3
"""Build the v3 background and its fixed transparent-crystal overlay.

The video reconstruction is deterministic and frame-by-frame:

* the full character footprint is replaced, so no white character blocks move;
* the white/water boundary is sub-pixel blended instead of stair-stepped;
* reconstructed water is feathered into untouched water over a wide band,
  removing the former dotted mirror seam;
* water outside the reconstruction stays on the untouched source layer; and
* H.264 is encoded losslessly while the source audio is copied.

The colorful shards formerly crossing the character are extracted once from a
reference frame, repaired to complete silhouettes, and rendered as a fixed
transparent crystal PNG with original magenta/violet colors.

Usage:
    python3 scripts/process-background.py INPUT.mp4 OUTPUT.mp4 \
        --fragments OUTPUT.png
"""

from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage


WIDTH = 1920
HEIGHT = 1080
FPS = 30
RGB_FRAME_BYTES = WIDTH * HEIGHT * 3
LUMA_BYTES = WIDTH * HEIGHT
CHROMA_BYTES = (WIDTH // 2) * (HEIGHT // 2)
YUV_FRAME_BYTES = LUMA_BYTES + 2 * CHROMA_BYTES


def smoothstep(value: np.ndarray) -> np.ndarray:
    value = np.clip(value, 0.0, 1.0)
    return value * value * (3.0 - 2.0 * value)


def reconstruction_geometry() -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """Return the curved visual boundary and inner/outer repair edges."""

    y = np.arange(HEIGHT, dtype=np.float64)
    boundary = 728 - 0.125 * y + 11 * np.sin(y / 145)

    # The inner edge is safely beyond every pose of the character. Between the
    # inner and outer edges, reconstructed water crossfades to original water.
    inner_right = np.interp(
        y,
        [0, 220, 500, 760, 1080],
        [945, 900, 845, 785, 700],
    )
    outer_right = inner_right + 128
    return boundary, inner_right, outer_right


def repair_plane(
    plane: np.ndarray,
    boundary: np.ndarray,
    inner_right: np.ndarray,
    outer_right: np.ndarray,
    white_level: int,
    boundary_width: float,
) -> np.ndarray:
    """Repair one YUV plane while copying every pixel outside the mask."""

    width = plane.shape[1]
    x = np.arange(width, dtype=np.float64)[None, :]
    reconstruction = x < outer_right[:, None]

    rows, columns = np.nonzero(reconstruction)
    source_columns = np.rint(
        2 * outer_right[rows] - 1 - columns
    ).astype(np.int32)
    source_columns = np.clip(source_columns, 0, width - 1)
    reflected_water = plane[rows, source_columns].astype(np.float64)

    # The wide blend eliminates the internal reflection seam highlighted in
    # the v2 screenshot. Its far edge is exactly the original water.
    seam_mix = smoothstep(
        (columns - inner_right[rows]) / (outer_right[rows] - inner_right[rows])
    )
    original_water = plane[rows, columns].astype(np.float64)
    water = reflected_water * (1.0 - seam_mix) + original_water * seam_mix

    # A six-pixel smooth transition removes staircase pixels at the curved
    # white/water boundary without revealing the source character underneath.
    water_mix = smoothstep(
        (columns - (boundary[rows] - boundary_width / 2.0)) / boundary_width
    )
    repaired = white_level * (1.0 - water_mix) + water * water_mix

    result = plane.copy()
    result[rows, columns] = np.clip(np.rint(repaired), 0, 255).astype(np.uint8)
    return result


def make_clean_yuv_frame(raw: bytes) -> bytes:
    """Return one repaired YUV420 frame with untouched YUV samples preserved."""

    packed = np.frombuffer(raw, dtype=np.uint8)
    luma = packed[:LUMA_BYTES].reshape((HEIGHT, WIDTH))
    chroma_u = packed[LUMA_BYTES : LUMA_BYTES + CHROMA_BYTES].reshape(
        (HEIGHT // 2, WIDTH // 2)
    )
    chroma_v = packed[LUMA_BYTES + CHROMA_BYTES :].reshape(
        (HEIGHT // 2, WIDTH // 2)
    )

    boundary, inner_right, outer_right = reconstruction_geometry()
    repaired_luma = repair_plane(
        luma,
        boundary,
        inner_right,
        outer_right,
        white_level=235,
        boundary_width=6.0,
    )
    repaired_u = repair_plane(
        chroma_u,
        boundary[::2] / 2.0,
        inner_right[::2] / 2.0,
        outer_right[::2] / 2.0,
        white_level=128,
        boundary_width=3.0,
    )
    repaired_v = repair_plane(
        chroma_v,
        boundary[::2] / 2.0,
        inner_right[::2] / 2.0,
        outer_right[::2] / 2.0,
        white_level=128,
        boundary_width=3.0,
    )

    # A former implementation sent the repair to ffmpeg as an RGBA overlay;
    # YUV chroma subsampling around its transparent diagonal edge caused the
    # dotted line visible in the browser. A complete YUV frame has no alpha
    # edge, while every sample outside the repair is copied bit-for-bit from
    # the decoded source.
    return repaired_luma.tobytes() + repaired_u.tobytes() + repaired_v.tobytes()

def filtered_magenta_cores(frame: np.ndarray) -> np.ndarray:
    red = frame[:, :, 0].astype(np.int16)
    green = frame[:, :, 1].astype(np.int16)
    blue = frame[:, :, 2].astype(np.int16)
    x = np.arange(WIDTH)[None, :]
    y = np.arange(HEIGHT)[:, None]

    seed = (
        (red > 104)
        & (blue > 62)
        & ((red - green) > 34)
        & ((blue - green) > 14)
    )
    original_fragment_zones = (
        ((x > 610) & (y < 470))
        | ((x > 320) & (y > 650))
    )
    labels, _ = ndimage.label(
        seed & original_fragment_zones,
        structure=np.ones((3, 3), dtype=np.uint8),
    )
    selected = np.zeros((HEIGHT, WIDTH), dtype=bool)
    for label_id, slices in enumerate(ndimage.find_objects(labels), start=1):
        if slices is None:
            continue
        ys, xs = slices
        component = labels[ys, xs] == label_id
        area = int(component.sum())
        width = xs.stop - xs.start
        height = ys.stop - ys.start
        if 8 <= area <= 9000 and width <= 240 and height <= 240:
            selected[ys, xs] |= component
    return selected


def create_crystal_overlay(reference: np.ndarray, destination: Path) -> None:
    """Repair original shard silhouettes and render them as translucent glass."""

    red = reference[:, :, 0].astype(np.int16)
    green = reference[:, :, 1].astype(np.int16)
    blue = reference[:, :, 2].astype(np.int16)
    cores = filtered_magenta_cores(reference)

    colorful_neighborhood = (
        (red > 45)
        & (blue > 48)
        & ((red - green) > 14)
        & ((blue - green) > 3)
    )
    nearby = ndimage.binary_dilation(cores, iterations=8)
    shape = colorful_neighborhood & nearby
    shape = ndimage.binary_closing(shape, iterations=2)
    shape = ndimage.binary_fill_holes(shape)
    shape |= ndimage.binary_dilation(cores, iterations=1)

    rgba = np.zeros((HEIGHT, WIDTH, 4), dtype=np.uint8)
    labels, _ = ndimage.label(shape, structure=np.ones((3, 3), dtype=np.uint8))
    for label_id, slices in enumerate(ndimage.find_objects(labels), start=1):
        if slices is None:
            continue
        ys, xs = slices
        component = labels[ys, xs] == label_id
        area = int(component.sum())
        if area < 12:
            continue

        local_reference = reference[ys, xs, :].astype(np.float64)
        local_rgba = rgba[ys, xs, :]
        height, width = component.shape

        # Preserve the original color family while lifting it into luminous,
        # semitransparent crystal.
        crystal_tint = np.array([201.0, 70.0, 232.0])
        base = local_reference * 0.80 + crystal_tint * 0.20
        local_rgba[component, :3] = np.clip(base[component], 0, 255).astype(np.uint8)
        local_rgba[component, 3] = 120

        eroded = ndimage.binary_erosion(component, iterations=1)
        edge = component & ~eroded
        yy, xx = np.mgrid[0:height, 0:width]
        x_norm = xx / max(width - 1, 1)
        y_norm = yy / max(height - 1, 1)

        # Cool white/cyan light catches the upper-left facets; the lower-right
        # facets retain a deeper violet edge.
        bright_edge = edge & ((0.72 * x_norm + y_norm) < 1.05)
        dark_edge = edge & ~bright_edge
        local_rgba[bright_edge, :3] = np.array([226, 250, 255], dtype=np.uint8)
        local_rgba[bright_edge, 3] = 222
        local_rgba[dark_edge, :3] = np.array([89, 38, 198], dtype=np.uint8)
        local_rgba[dark_edge, 3] = 205

        # One restrained diagonal reflection per shard makes the material read
        # as glass without changing its original silhouette.
        reflection = (
            component
            & (np.abs(x_norm - (0.28 + 0.42 * y_norm)) < 0.045)
            & (y_norm < 0.78)
        )
        local_rgba[reflection, :3] = np.array([238, 252, 255], dtype=np.uint8)
        local_rgba[reflection, 3] = 188

    destination.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(rgba, mode="RGBA").save(destination, optimize=False)


def read_exact(stream, size: int) -> bytes:
    chunks: list[bytes] = []
    remaining = size
    while remaining:
        chunk = stream.read(remaining)
        if not chunk:
            break
        chunks.append(chunk)
        remaining -= len(chunk)
    return b"".join(chunks)


def extract_reference_frame(source: Path, seconds: float = 5.5) -> np.ndarray:
    process = subprocess.run(
        [
            "ffmpeg",
            "-v",
            "error",
            "-ss",
            str(seconds),
            "-i",
            str(source),
            "-frames:v",
            "1",
            "-f",
            "rawvideo",
            "-pix_fmt",
            "rgb24",
            "pipe:1",
        ],
        check=True,
        stdout=subprocess.PIPE,
    )
    if len(process.stdout) != RGB_FRAME_BYTES:
        raise RuntimeError("Could not extract the crystal reference frame")
    return np.frombuffer(process.stdout, dtype=np.uint8).reshape((HEIGHT, WIDTH, 3))


def process(source: Path, destination: Path, fragments: Path | None) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    if fragments is not None:
        create_crystal_overlay(extract_reference_frame(source), fragments)

    decoder = subprocess.Popen(
        [
            "ffmpeg",
            "-v",
            "error",
            "-i",
            str(source),
            "-map",
            "0:v:0",
            "-f",
            "rawvideo",
            "-pix_fmt",
            "yuv420p",
            "pipe:1",
        ],
        stdout=subprocess.PIPE,
    )

    encoder = subprocess.Popen(
        [
            "ffmpeg",
            "-y",
            "-v",
            "error",
            "-i",
            str(source),
            "-f",
            "rawvideo",
            "-pix_fmt",
            "yuv420p",
            "-video_size",
            f"{WIDTH}x{HEIGHT}",
            "-framerate",
            str(FPS),
            "-i",
            "pipe:0",
            "-map",
            "1:v:0",
            "-map",
            "0:a?",
            "-c:v",
            "libx264",
            "-preset",
            "veryslow",
            "-crf",
            "0",
            "-pix_fmt",
            "yuv420p",
            "-c:a",
            "copy",
            "-movflags",
            "+faststart",
            str(destination),
        ],
        stdin=subprocess.PIPE,
    )

    assert decoder.stdout is not None
    assert encoder.stdin is not None

    frame_count = 0
    try:
        while True:
            raw = read_exact(decoder.stdout, YUV_FRAME_BYTES)
            if not raw:
                break
            if len(raw) != YUV_FRAME_BYTES:
                raise RuntimeError(f"Incomplete decoded frame: {len(raw)} bytes")
            encoder.stdin.write(make_clean_yuv_frame(raw))
            frame_count += 1
            if frame_count % FPS == 0:
                print(f"Processed {frame_count / FPS:.0f}s", file=sys.stderr)
    finally:
        encoder.stdin.close()
        decoder.stdout.close()

    decoder_result = decoder.wait()
    encoder_result = encoder.wait()
    if decoder_result != 0 or encoder_result != 0:
        raise RuntimeError(
            f"ffmpeg failed (decoder={decoder_result}, encoder={encoder_result})"
        )
    if frame_count == 0:
        raise RuntimeError("No video frames were decoded")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("destination", type=Path)
    parser.add_argument("--fragments", type=Path)
    args = parser.parse_args()
    process(
        args.source.resolve(),
        args.destination.resolve(),
        args.fragments.resolve() if args.fragments else None,
    )


if __name__ == "__main__":
    main()
