import Image from "next/image";

export function BrandLogo() {
  return (
    <span className="brand-logo">
      <Image
        src="/images/transchibaro-logo.png"
        alt="TransChibaro Logistics"
        width={1280}
        height={1280}
        preload
      />
    </span>
  );
}
