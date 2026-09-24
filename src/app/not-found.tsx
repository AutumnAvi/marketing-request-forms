import Link from "next/link";
import { ArrowLeft } from "@/components/Icons";

export default function NotFound() {
  return (
    <div className="container" style={{ display: "grid", gap: 20, maxWidth: 640 }}>
      <span className="eyebrow">404</span>
      <h1 className="title-1">That page isn&rsquo;t in the hub.</h1>
      <p className="lede">
        The section or form may have been renamed or unpublished. Head back to the request hub to find the right form.
      </p>
      <div>
        <Link href="/" className="btn">
          <ArrowLeft /> Back to the hub
        </Link>
      </div>
    </div>
  );
}
