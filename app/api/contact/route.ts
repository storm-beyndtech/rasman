import { NextRequest, NextResponse } from "next/server";
import { contactSchema } from "@/lib/validations";
import { EmailService } from "@/lib/email";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const validated = contactSchema.parse(body);

		const sent = await EmailService.sendContactMessage({
			name: validated.name,
			email: validated.email,
			subject: validated.subject,
			content: validated.message,
		});

		if (!sent) {
			return NextResponse.json({ success: false, error: "Unable to send your message right now" }, { status: 500 });
		}

		return NextResponse.json({ success: true, message: "Message sent successfully" });
	} catch (error: any) {
		if (error?.name === "ZodError") {
			return NextResponse.json(
				{ success: false, error: "Invalid input", details: error.errors },
				{ status: 400 },
			);
		}

		console.error("Contact form error:", error);
		return NextResponse.json({ success: false, error: "Failed to send message" }, { status: 500 });
	}
}
