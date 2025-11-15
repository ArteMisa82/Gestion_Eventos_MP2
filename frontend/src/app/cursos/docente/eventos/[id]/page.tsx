import EventPanel from "@/components/docente/EventPanel";

type Props = { params: { id: string } };

export default function EventoDetallePage({ params }: Props) {
  return <EventPanel eventId={params.id} />;
}
