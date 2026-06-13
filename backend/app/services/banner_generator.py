"""Generate animated banner GIFs for email invitations."""

from PIL import Image, ImageDraw, ImageFont
import io
import os

PHRASES = [
    "Create Your Own Event",
    "Send Branded Invites",
    "Generate QR Codes",
    "Track Attendance",
]

BRAND_PINK = "#E91E8C"
BRAND_DARK = "#0D1B2A"


def generate_animated_banner_gif(output_path: str = None) -> bytes:
    """
    Generate an animated GIF banner with typewriter effect for the Accredit.vip motion banner.
    Shows "Join" text with logo, then features appearing character by character.

    Returns the GIF as bytes if output_path is None, otherwise saves to file.
    """
    frames = []
    frame_duration = 100  # milliseconds per frame

    # Image dimensions
    width, height = 600, 120
    bg_gradient_start = (233, 30, 140)  # Pink
    bg_gradient_end = (196, 22, 111)    # Dark pink
    text_color_rgb = (255, 255, 255)    # White

    # Try to load logo
    logo = None
    try:
        import os as os_module
        logo_path = os_module.path.join(
            os_module.path.dirname(os_module.path.dirname(os_module.path.dirname(__file__))),
            "..", "frontend", "public", "logo-white.png"
        )
        if os_module.path.exists(logo_path):
            logo = Image.open(logo_path).convert("RGBA")
            # Resize logo to fit in banner (height ~30px with padding)
            logo_height = 30
            aspect_ratio = logo.width / logo.height
            logo_width = int(logo_height * aspect_ratio)
            logo = logo.resize((logo_width, logo_height), Image.Resampling.LANCZOS)
    except Exception as e:
        print(f"Warning: Could not load logo: {e}")

    phrase_index = 0
    current_phrase = PHRASES[phrase_index]

    # Phase 1: Type out text character by character
    for char_count in range(len(current_phrase) + 1):
        frame = Image.new("RGB", (width, height), color=bg_gradient_start)
        draw = ImageDraw.Draw(frame)

        # Try to load a nice font, fall back to default
        try:
            font = ImageFont.truetype("arial.ttf", 36)
            small_font = ImageFont.truetype("arial.ttf", 14)
        except:
            font = ImageFont.load_default()
            small_font = ImageFont.load_default()

        # Draw gradient effect (simple horizontal gradient by drawing lines)
        for x in range(width):
            r = int(bg_gradient_start[0] + (bg_gradient_end[0] - bg_gradient_start[0]) * x / width)
            g = int(bg_gradient_start[1] + (bg_gradient_end[1] - bg_gradient_start[1]) * x / width)
            b = int(bg_gradient_start[2] + (bg_gradient_end[2] - bg_gradient_start[2]) * x / width)
            draw.line([(x, 0), (x, height)], fill=(r, g, b))

        # Draw "Join" text and logo
        join_text = "Join "
        bbox = draw.textbbox((0, 0), join_text, font=small_font)
        join_width = bbox[2] - bbox[0]

        # Calculate positions for "Join" + logo
        logo_width_px = logo.width if logo else 0
        total_width = join_width + logo_width_px + 5  # 5px gap
        start_x = (width - total_width) // 2

        # Draw "Join" text
        draw.text(
            (start_x, 50),
            join_text,
            fill=text_color_rgb,
            font=small_font
        )

        # Draw logo if available
        if logo:
            logo_frame = Image.new("RGB", frame.size, color=bg_gradient_start)
            logo_frame.paste(logo, (start_x + join_width + 5, 45), logo)
            frame = Image.composite(logo_frame, frame, Image.new("L", frame.size, 0))

        # Draw typing text
        typing_text = current_phrase[:char_count]
        bbox = draw.textbbox((0, 0), typing_text, font=font)
        text_width = bbox[2] - bbox[0]
        draw.text(
            ((width - text_width) // 2, 55),
            typing_text,
            fill=text_color_rgb,
            font=font
        )

        # Add cursor
        if char_count < len(current_phrase):
            cursor_x = (width // 2) + (text_width // 2) + 5
            draw.line([(cursor_x, 55), (cursor_x, 85)], fill=text_color_rgb, width=2)

        frames.append(frame)

    # Phase 2: Hold the complete text for 2 seconds (20 frames at 100ms)
    for _ in range(20):
        frame = Image.new("RGB", (width, height), color=bg_gradient_start)
        draw = ImageDraw.Draw(frame)

        # Draw gradient
        for x in range(width):
            r = int(bg_gradient_start[0] + (bg_gradient_end[0] - bg_gradient_start[0]) * x / width)
            g = int(bg_gradient_start[1] + (bg_gradient_end[1] - bg_gradient_start[1]) * x / width)
            b = int(bg_gradient_start[2] + (bg_gradient_end[2] - bg_gradient_start[2]) * x / width)
            draw.line([(x, 0), (x, height)], fill=(r, g, b))

        # Draw "Join" and logo
        join_text = "Join "
        bbox = draw.textbbox((0, 0), join_text, font=small_font)
        join_width = bbox[2] - bbox[0]
        logo_width_px = logo.width if logo else 0
        total_width = join_width + logo_width_px + 5
        start_x = (width - total_width) // 2

        draw.text((start_x, 50), join_text, fill=text_color_rgb, font=small_font)
        if logo:
            logo_frame = Image.new("RGB", frame.size, color=bg_gradient_start)
            logo_frame.paste(logo, (start_x + join_width + 5, 45), logo)
            frame = Image.composite(logo_frame, frame, Image.new("L", frame.size, 0))

        bbox = draw.textbbox((0, 0), current_phrase, font=font)
        text_width = bbox[2] - bbox[0]
        draw.text(
            ((width - text_width) // 2, 85),
            current_phrase,
            fill=text_color_rgb,
            font=font
        )

        frames.append(frame)

    # Phase 3: Delete text character by character
    for char_count in range(len(current_phrase), -1, -1):
        frame = Image.new("RGB", (width, height), color=bg_gradient_start)
        draw = ImageDraw.Draw(frame)

        # Draw gradient
        for x in range(width):
            r = int(bg_gradient_start[0] + (bg_gradient_end[0] - bg_gradient_start[0]) * x / width)
            g = int(bg_gradient_start[1] + (bg_gradient_end[1] - bg_gradient_start[1]) * x / width)
            b = int(bg_gradient_start[2] + (bg_gradient_end[2] - bg_gradient_start[2]) * x / width)
            draw.line([(x, 0), (x, height)], fill=(r, g, b))

        # Draw "Join" and logo
        join_text = "Join "
        bbox = draw.textbbox((0, 0), join_text, font=small_font)
        join_width = bbox[2] - bbox[0]
        logo_width_px = logo.width if logo else 0
        total_width = join_width + logo_width_px + 5
        start_x = (width - total_width) // 2

        draw.text((start_x, 50), join_text, fill=text_color_rgb, font=small_font)
        if logo:
            logo_frame = Image.new("RGB", frame.size, color=bg_gradient_start)
            logo_frame.paste(logo, (start_x + join_width + 5, 45), logo)
            frame = Image.composite(logo_frame, frame, Image.new("L", frame.size, 0))

        typing_text = current_phrase[:char_count]
        if typing_text:
            bbox = draw.textbbox((0, 0), typing_text, font=font)
            text_width = bbox[2] - bbox[0]
            draw.text(
                ((width - text_width) // 2, 85),
                typing_text,
                fill=text_color_rgb,
                font=font
            )

        frames.append(frame)

    # Phase 4: Pause before next phrase
    for _ in range(5):
        frame = Image.new("RGB", (width, height), color=bg_gradient_start)
        draw = ImageDraw.Draw(frame)
        for x in range(width):
            r = int(bg_gradient_start[0] + (bg_gradient_end[0] - bg_gradient_start[0]) * x / width)
            g = int(bg_gradient_start[1] + (bg_gradient_end[1] - bg_gradient_start[1]) * x / width)
            b = int(bg_gradient_start[2] + (bg_gradient_end[2] - bg_gradient_start[2]) * x / width)
            draw.line([(x, 0), (x, height)], fill=(r, g, b))

        # Draw "Join" and logo during pause
        join_text = "Join "
        bbox = draw.textbbox((0, 0), join_text, font=small_font)
        join_width = bbox[2] - bbox[0]
        logo_width_px = logo.width if logo else 0
        total_width = join_width + logo_width_px + 5
        start_x = (width - total_width) // 2

        draw.text((start_x, 50), join_text, fill=text_color_rgb, font=small_font)
        if logo:
            logo_frame = Image.new("RGB", frame.size, color=bg_gradient_start)
            logo_frame.paste(logo, (start_x + join_width + 5, 45), logo)
            frame = Image.composite(logo_frame, frame, Image.new("L", frame.size, 0))

        frames.append(frame)

    # Save as GIF
    if frames:
        gif_buffer = io.BytesIO()
        frames[0].save(
            gif_buffer,
            format="GIF",
            save_all=True,
            append_images=frames[1:],
            duration=frame_duration,
            loop=0,  # Infinite loop
            optimize=False
        )
        gif_buffer.seek(0)

        if output_path:
            with open(output_path, "wb") as f:
                f.write(gif_buffer.getvalue())

        return gif_buffer.getvalue()

    return b""
