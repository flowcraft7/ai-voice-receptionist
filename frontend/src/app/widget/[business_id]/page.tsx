"use client";
import { useParams } from "next/navigation";
import VoiceWidget from "../../components/VoiceWidget";

export default function WidgetPage() {
  const params = useParams();
  const businessId = params.business_id as string;

  return (
    <div style={{ width: "100%", height: "100vh", overflow: "hidden" }}>
      <VoiceWidget businessId={businessId} />
    </div>
  );
}