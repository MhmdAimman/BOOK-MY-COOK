import os
from flask import render_template, current_app
from flask_mail import Mail, Message

mail = Mail()


def init_mail(app):
    app.config["MAIL_SERVER"] = os.environ.get("MAIL_SERVER", "smtp.gmail.com")
    app.config["MAIL_PORT"] = int(os.environ.get("MAIL_PORT", 587))
    app.config["MAIL_USE_TLS"] = os.environ.get("MAIL_USE_TLS", "true").lower() in [
        "true",
        "on",
        "1",
    ]
    app.config["MAIL_USERNAME"] = os.environ.get("MAIL_USERNAME")
    app.config["MAIL_PASSWORD"] = os.environ.get("MAIL_PASSWORD")
    app.config["MAIL_DEFAULT_SENDER"] = os.environ.get(
        "MAIL_DEFAULT_SENDER", "noreply@bookmycook.in"
    )

    mail.init_app(app)


def send_email(to_email, subject, template_name, **context):
    try:
        msg = Message(
            subject=subject,
            recipients=[to_email],
            html=render_template(f"emails/{template_name}.html", **context),
        )
        mail.send(msg)
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False


def send_booking_created_email(
    provider_email, provider_name, customer_name, booking_details
):
    return send_email(
        to_email=provider_email,
        subject=f"New Booking Request - BOOKMYCOOK",
        template_name="booking_created",
        provider_name=provider_name,
        customer_name=customer_name,
        booking=booking_details,
    )


def send_booking_confirmed_email(
    customer_email, customer_name, provider_name, booking_details
):
    return send_email(
        to_email=customer_email,
        subject=f"Booking Confirmed - BOOKMYCOOK",
        template_name="booking_confirmed",
        customer_name=customer_name,
        provider_name=provider_name,
        booking=booking_details,
    )


def send_booking_rejected_email(
    customer_email, customer_name, provider_name, booking_details, reason
):
    return send_email(
        to_email=customer_email,
        subject=f"Booking Update - BOOKMYCOOK",
        template_name="booking_rejected",
        customer_name=customer_name,
        provider_name=provider_name,
        booking=booking_details,
        reason=reason,
    )


def send_booking_cancelled_email(to_email, user_name, booking_details, cancelled_by):
    return send_email(
        to_email=to_email,
        subject=f"Booking Cancelled - BOOKMYCOOK",
        template_name="booking_cancelled",
        user_name=user_name,
        booking=booking_details,
        cancelled_by=cancelled_by,
    )


def send_payment_received_email(
    provider_email, provider_name, customer_name, booking_details, amount
):
    return send_email(
        to_email=provider_email,
        subject=f"Payment Received - BOOKMYCOOK",
        template_name="payment_received",
        provider_name=provider_name,
        customer_name=customer_name,
        booking=booking_details,
        amount=amount,
    )
