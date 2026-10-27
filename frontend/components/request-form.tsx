"use client";
import Link from "next/link";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowUpRight, CheckCircle2, LoaderCircle } from "lucide-react";
import { services } from "@/lib/business";
import { api } from "@/lib/api";
const schema = z.object({
  fullName: z.string().min(2, "Enter your full name").max(150),
  phone: z.string().regex(/^[+0-9 ()-]{7,30}$/, "Enter a valid phone number"),
  email: z.union([z.email(), z.literal("")]),
  pickup: z.string().min(2, "Enter a pickup location").max(500),
  destination: z.string().min(2, "Enter a destination").max(500),
  serviceId: z.string().min(1, "Select a service"),
  goods: z.string().min(3, "Describe your load").max(5000),
  weightKg: z.number().positive("Enter an estimated weight").max(1000000),
  preferredDate: z.string().min(1, "Choose a date"),
  preferredTime: z.string().min(1, "Choose a time"),
  rateType: z.enum(["DRY", "WET", "DISCUSS"]),
  instructions: z.string().max(5000),
  consent: z
    .boolean()
    .refine(Boolean, "Please agree so we can process your request"),
  website: z.string().max(0),
});
type Values = z.infer<typeof schema>;
export function RequestForm({ booking = false }: { booking?: boolean }) {
  const [submissionKey, setSubmissionKey] = useState("");
  const [result, setResult] = useState<{
    reference: string;
    review_required: boolean;
  } | null>(null);
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      rateType: "DISCUSS",
      instructions: "",
      email: "",
      website: "",
      consent: false,
    },
  });
  const weight = useWatch({ control, name: "weightKg" });
  async function submit(values: Values) {
    setError("");
    const key = submissionKey || crypto.randomUUID();
    setSubmissionKey(key);
    try {
      setResult(
        await api(booking ? "/bookings" : "/quotes", {
          method: "POST",
          body: JSON.stringify({ ...values, submissionKey: key }),
        }),
      );
    } catch (e) {
      setError((e as Error).message);
    }
  }
  const field = (
    name: keyof Values,
    label: string,
    type = "text",
    required = true,
  ) => (
    <label className="field" key={name}>
      {label}
      {required && " *"}
      <input
        type={type}
        autoComplete={name === "fullName" ? "name" : name === "phone" ? "tel" : name === "email" ? "email" : undefined}
        inputMode={name === "weightKg" ? "decimal" : name === "phone" ? "tel" : name === "email" ? "email" : undefined}
        aria-required={required}
        {...register(name, { valueAsNumber: name === "weightKg" })}
        min={
          name === "weightKg"
            ? "0.01"
            : name === "preferredDate"
              ? new Date().toLocaleDateString("en-CA")
              : undefined
        }
        step={name === "weightKg" ? "0.01" : undefined}
        aria-invalid={!!errors[name]}
      />
      {errors[name] && <small className="error">{errors[name]?.message}</small>}
    </label>
  );
  if (result)
    return (
      <div className="success" role="status">
        <CheckCircle2 size={40} />
        <h3>Request received.</h3>
        <p>
          Your reference is <strong>{result.reference}</strong>.
        </p>
        <p>
          Our team will review your load and contact you to discuss pricing and
          arrangements. This is not a confirmed booking.
        </p>
        {result.review_required && (
          <p>Your estimated load requires additional capacity review.</p>
        )}
        <a className="button" href="https://wa.me/263775008064">
          Continue on WhatsApp <ArrowUpRight size={18} />
        </a>
      </div>
    );
  return (
    <form className="request-form" onSubmit={handleSubmit(submit)} noValidate>
      <div className="form-grid">
        {field("fullName", "Full name")}
        {field("phone", "Phone number", "tel")}
        {field("email", "Email address", "email", false)}
        <label className="field">
          Service *
          <select {...register("serviceId")}>
            <option value="">Select a service</option>
            {services.map((s) => (
              <option value={s.slug} key={s.slug}>
                {s.name}
              </option>
            ))}
          </select>
          {errors.serviceId && (
            <small className="error">{errors.serviceId.message}</small>
          )}
        </label>
        {field("pickup", "Pickup location")}
        {field("destination", "Delivery destination")}
        <label className="field span-2">
          Description of goods *
          <textarea
            rows={3}
            {...register("goods")}
            placeholder="What are we moving? Include dimensions or access requirements."
          />
          {errors.goods && (
            <small className="error">{errors.goods.message}</small>
          )}
        </label>
        {field("weightKg", "Estimated load weight (kg)", "number")}
        <label className="field">
          Rate preference *
          <select {...register("rateType")}>
            <option value="DISCUSS">Please explain my options</option>
            <option value="DRY">Dry rate</option>
            <option value="WET">Wet rate</option>
          </select>
        </label>
        {field("preferredDate", "Preferred pickup date", "date")}
        {field("preferredTime", "Preferred pickup time", "time")}
        <label className="field span-2">
          Additional instructions
          <textarea rows={2} {...register("instructions")} />
        </label>
      </div>
      {Number(weight) > 3000 && (
        <p className="notice">
          This load exceeds the truckâ€™s stated 3,000 kg capacity. Our team must
          review suitable arrangements.
        </p>
      )}
      <div className="honey" aria-hidden="true">
        <label>
          Website
          <input tabIndex={-1} autoComplete="off" {...register("website")} />
        </label>
      </div>
      <label className="check">
        <input type="checkbox" {...register("consent")} />
        <span>
          I agree to the <Link href="/privacy-policy">privacy policy</Link> and
          being contacted about this request.
        </span>
      </label>
      {errors.consent && <p className="error">{errors.consent.message}</p>}
      <p className="form-note">
        Rates and availability are confirmed after review. For supporting
        photographs, contact our team on WhatsApp and include your request
        reference.
      </p>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <button disabled={isSubmitting} className="button" type="submit">
        {isSubmitting ? <LoaderCircle className="spin" size={18} /> : null}
        {isSubmitting
          ? "Sending request..."
          : booking
            ? "Submit booking request"
            : "Request my quotation"}
        <ArrowUpRight size={18} />
      </button>
    </form>
  );
}
