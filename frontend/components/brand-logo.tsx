import Image from "next/image";

export function BrandLogo() {
  return (
    <span className="brand-logo">
      <Image
        src="/images/transchibaro-logo.png"
        alt="TransChibaro Logistics — truck, road and location pin logo"
        width={1254}
        height={1254}
        sizes="(max-width: 800px) 138px, 172px"
        preload
      />
    </span>
  );
}
