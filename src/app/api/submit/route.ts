import JSZip from "jszip";
import { type NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const client = formData.get("client") as string;
    const period = formData.get("period") as string;

    // Create zip file
    const zip = new JSZip();
    const files = formData.getAll("files") as File[];
    const fileFields = formData.getAll("fileFields") as string[];

    // Add files to zip organized by section/field
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fieldPath = fileFields[i];
      const arrayBuffer = await file.arrayBuffer();

      // Use section/field as folder structure
      zip.file(`${fieldPath}/${file.name}`, arrayBuffer);
    }

    // Generate zip file
    const zipContent = await zip.generateAsync({ type: "nodebuffer" });

    // Create email transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    // Send email with zip attachment
    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: process.env.TO_EMAIL,
      subject: `Form Submission - ${client} - ${period}`,
      text: `New form submission from ${client} for period ${period}`,
      attachments: [
        {
          filename: `${client}-${period}-documents.zip`,
          content: zipContent,
        },
      ],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing form submission:", error);
    return NextResponse.json({ error: "Failed to process form submission" }, { status: 500 });
  }
}
