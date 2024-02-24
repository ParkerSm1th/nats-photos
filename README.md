![SCR-20240224-etv](https://github.com/ParkerSm1th/nats-photos/assets/26879228/ef120de2-6375-41a0-b2c5-32f7c8f3ba69)
# Natalie's Photos - a powerful photography dashboard
This project is a functional and powerful dashboard for photographers to host their own photos without having to worry about handing payments, watermarking or storing photos.

[View production app](https://natalielockhartphotos.com)

# Features
- Beautiful home page showcasing some of your favorite work
- Fast and responsive navigation across the dashboard to find different projects
- User authentication and access control
- Admin dashboard allowing you to organize, edit, and upload photos
- Stripe integration for payment of photos
- Auto-watermarking and downscaling of photos for public display
- S3 bucket storage

# How it works
Core Stack: Typescript + Next.js + Tailwind + Clerk

--

Getting more in to the weeds of what this app's main function is, storing photos securely. When an admin uploads a photo we store the original version in S3 and then downsize & append the watermark to the downscaled. We use an S3 bucket to store the photos and they are all only accessible via a single use link that is generated on page load that is cached using Redis. Purchases are handled via Stripe and we handle storing purchases via the webhook.
