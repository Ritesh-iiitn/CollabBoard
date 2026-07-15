'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useUser from "@/hooks/useUser";
import Whiteboard from "./WhiteBoard";
import { createRoom } from "@/lib/roomService";
import CollabPlusProvider from "@/components/collabplus/CollabPlusProvider";
import PresenceOverlay from "@/components/collabplus/PresenceOverlay";
import CollabPlusToolbar from "@/components/collabplus/CollabPlusToolbar";
import AiPlusPanel from "@/components/collabplus/AiPlusPanel";
import { useBoardStore } from "@/stores/boardStore";

export default function RoomClient({ roomId }: { roomId: string }) {
  const { user, loading } = useUser();
  const router = useRouter();
  const collabPlus = useBoardStore((s) => s.collabPlusEnabled);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    console.log("🔥 Creating Firestore Room:", roomId);
    createRoom(roomId, user);

  }, [user, loading, roomId, router]);

  if (loading) {
    return (
      <div className="text-white flex items-center justify-center h-screen">
        Loading room…
      </div>
    );
  }

  if (!user) return null;

  const userEmail = user.email ?? "anonymous";

  return (
    <CollabPlusProvider roomId={roomId} userId={userEmail}>
      <div className="relative h-screen w-full">
        {collabPlus && (
          <>
            <CollabPlusToolbar roomId={roomId} />
            <PresenceOverlay roomId={roomId} userId={userEmail} name={userEmail} />
            <AiPlusPanel roomId={roomId} getBoardText={() => ""} />
          </>
        )}
        <Whiteboard roomId={roomId} userEmail={userEmail} />
      </div>
    </CollabPlusProvider>
  );
}
