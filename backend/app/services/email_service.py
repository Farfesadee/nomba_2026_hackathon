import asyncio
import os
import smtplib
import ssl
from email.mime.image import MIMEImage
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import httpx
from app.core.config import settings


async def send_email(to: str, subject: str, html: str, from_addr: str | None = None) -> bool:
    sender = from_addr or settings.EMAIL_FROM
    if settings.SMTP_HOST and settings.SMTP_USERNAME:
        ok = await _send_smtp(to, subject, html, sender)
        if ok:
            return True
        print("[Email] SMTP failed, trying SendGrid...")
    if settings.SENDGRID_API_KEY:
        ok = await _send_sendgrid(to, subject, html, sender)
        if ok:
            return True
        print("[Email] SendGrid failed, trying Resend...")
    if settings.RESEND_API_KEY:
        return await _send_resend(to, subject, html, sender)
    print(f"[Email Mock] From: {sender} -> To: {to}, Subject: {subject}")
    return True


async def send_email_with_images(to: str, subject: str, html: str, images: list[tuple[str, str]], from_addr: str | None = None) -> bool:
    """Send HTML email with inline images embedded as MIME attachments (cid: references).
    images: list of (cid_name, filepath) tuples. HTML should reference them as <img src='cid:cid_name'>.
    Tries SMTP first, falls back to SendGrid, then Resend if available.
    """
    sender = from_addr or settings.EMAIL_FROM
    if settings.SMTP_HOST and settings.SMTP_USERNAME:
        ok = await _send_smtp_with_images(to, subject, html, images, sender)
        if ok:
            return True
        print("[Email] SMTP failed, trying SendGrid...")
    if settings.SENDGRID_API_KEY:
        ok = await _send_sendgrid_with_images(to, subject, html, images, sender)
        if ok:
            return True
        print("[Email] SendGrid failed, trying Resend...")
    if settings.RESEND_API_KEY:
        return await _send_resend_with_images(to, subject, html, images, sender)
    print(f"[Email Mock] From: {sender} -> To: {to}, Subject: {subject}")
    return True


def _build_multipart_with_images(html: str, images: list[tuple[str, str]]) -> MIMEMultipart:
    msg = MIMEMultipart("related")
    msg.attach(MIMEText(html, "html"))
    for cid, filepath in images:
        try:
            with open(filepath, "rb") as f:
                img_data = f.read()
            subtype = filepath.rsplit(".", 1)[-1] if "." in filepath else None
            img = MIMEImage(img_data, _subtype=subtype)
            img.add_header("Content-ID", f"<{cid}>")
            img.add_header("Content-Disposition", "inline")
            msg.attach(img)
        except Exception as e:
            print(f"[Email] Failed to attach image {filepath}: {e}")
    return msg


async def _send_smtp(to: str, subject: str, html: str, from_addr: str) -> bool:
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = from_addr
    msg["To"] = to
    msg.attach(MIMEText(html, "html"))

    def _sync_send():
        try:
            ctx = ssl.create_default_context()
            with smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, context=ctx, timeout=10) as server:
                server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
                server.sendmail(from_addr, [to], msg.as_string())
            return True
        except Exception as e:
            print(f"[SMTP Error] {e}")
            return False

    try:
        return await asyncio.wait_for(
            asyncio.get_event_loop().run_in_executor(None, _sync_send),
            timeout=15
        )
    except asyncio.TimeoutError:
        print("[SMTP Error] Timed out after 15s")
        return False


async def _send_smtp_with_images(to: str, subject: str, html: str, images: list[tuple[str, str]], from_addr: str) -> bool:
    def _sync_send():
        try:
            msg = _build_multipart_with_images(html, images)
            msg["Subject"] = subject
            msg["From"] = from_addr
            msg["To"] = to
            msg_str = msg.as_string()
            ctx = ssl.create_default_context()
            with smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, context=ctx, timeout=10) as server:
                server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
                server.sendmail(from_addr, [to], msg_str)
            return True
        except Exception as e:
            print(f"[SMTP Error] {e}")
            return False

    try:
        return await asyncio.wait_for(
            asyncio.get_event_loop().run_in_executor(None, _sync_send),
            timeout=15
        )
    except asyncio.TimeoutError:
        print("[SMTP Error] Timed out after 15s")
        return False


async def _send_sendgrid(to: str, subject: str, html: str, from_addr: str) -> bool:
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            res = await client.post(
                "https://api.sendgrid.com/v3/mail/send",
                headers={
                    "Authorization": f"Bearer {settings.SENDGRID_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "personalizations": [{"to": [{"email": to}]}],
                    "from": {"email": from_addr},
                    "subject": subject,
                    "content": [{"type": "text/html", "value": html}],
                },
            )
            return res.is_success
    except Exception as e:
        print(f"[SendGrid Error] {e}")
        return False


async def _send_sendgrid_with_images(to: str, subject: str, html: str, images: list[tuple[str, str]], from_addr: str) -> bool:
    try:
        attachments = []
        for cid, filepath in images:
            try:
                with open(filepath, "rb") as f:
                    img_data = f.read()
                import base64
                encoded = base64.b64encode(img_data).decode()
                subtype = filepath.rsplit(".", 1)[-1] if "." in filepath else "png"
                attachments.append({
                    "content": encoded,
                    "type": f"image/{subtype}",
                    "filename": f"{cid}.{subtype}",
                    "disposition": "inline",
                    "content_id": cid,
                })
            except Exception as e:
                print(f"[SendGrid] Failed to attach {filepath}: {e}")
        async with httpx.AsyncClient(timeout=30) as client:
            res = await client.post(
                "https://api.sendgrid.com/v3/mail/send",
                headers={
                    "Authorization": f"Bearer {settings.SENDGRID_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "personalizations": [{"to": [{"email": to}]}],
                    "from": {"email": from_addr},
                    "subject": subject,
                    "content": [{"type": "text/html", "value": html}],
                    "attachments": attachments,
                },
            )
            return res.is_success
    except Exception as e:
        print(f"[SendGrid Error] {e}")
        return False


async def _send_resend_with_images(to: str, subject: str, html: str, images: list[tuple[str, str]], from_addr: str) -> bool:
    try:
        attachments = []
        for cid, filepath in images:
            try:
                with open(filepath, "rb") as f:
                    img_data = f.read()
                import base64
                encoded = base64.b64encode(img_data).decode()
                subtype = filepath.rsplit(".", 1)[-1] if "." in filepath else "png"
                attachments.append({
                    "content": encoded,
                    "filename": f"{cid}.{subtype}",
                    "disposition": "inline",
                    "content_id": cid,
                })
            except Exception as e:
                print(f"[Resend] Failed to attach {filepath}: {e}")
        async with httpx.AsyncClient(timeout=30) as client:
            res = await client.post(
                "https://api.resend.com/emails",
                headers={"Authorization": f"Bearer {settings.RESEND_API_KEY}"},
                json={
                    "from": from_addr,
                    "to": [to],
                    "subject": subject,
                    "html": html,
                    "attachments": attachments,
                },
            )
            return res.is_success
    except Exception as e:
        print(f"[Resend Error] {e}")
        return False


async def _send_resend(to: str, subject: str, html: str, from_addr: str) -> bool:
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            res = await client.post(
                "https://api.resend.com/emails",
                headers={"Authorization": f"Bearer {settings.RESEND_API_KEY}"},
                json={
                    "from": from_addr,
                    "to": [to],
                    "subject": subject,
                    "html": html,
                },
            )
            return res.is_success
    except Exception as e:
        print(f"[Resend Error] {e}")
        return False
