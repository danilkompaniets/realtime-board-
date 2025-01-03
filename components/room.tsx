"use client";

import {ClientSideSuspense, RoomProvider} from "@liveblocks/react";
import {ReactNode} from "react";
import {LiveList, LiveMap, LiveObject} from "@liveblocks/client";
import {Layer} from "@/types/canvas";

interface RoomProps {
    children: ReactNode;
    roomId: string;
    fallback: NonNullable<ReactNode> | null;
}

export const Room = ({children, roomId, fallback}: RoomProps) => {
    return (
        <RoomProvider
            id={roomId}
            initialPresence={{
                pencilDraft: null,
                penColor: null,
                cursor: null,
                selection: [],
            }}
            initialStorage={{
                layers: new LiveMap<string, LiveObject<Layer>>(),
                layerIds: new LiveList<string>([]),
            }}
        >
            <ClientSideSuspense fallback={fallback}>
                {() => children}
            </ClientSideSuspense>
        </RoomProvider>
    );
};