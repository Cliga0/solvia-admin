import { LoadingState } from "@/components/states";

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <LoadingState message="Loading..." size="lg" />
    </div>
  );
}
