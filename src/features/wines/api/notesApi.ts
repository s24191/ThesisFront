import {client} from "@/shared/api/client";
import type {WineNote} from "@/features/wines/types";

const wineNoteRoutes = {
  list: (
    wineId: number,
  ) => `/wines/${wineId}/notes`,

  mine: (
    wineId: number,
  ) => `/wines/${wineId}/notes/me`,

  toggle: (
    wineId: number,
    noteId: number,
  ) =>
    `/wines/${wineId}/notes/${noteId}/toggle`,
} as const;

type WineNotesResponse = {
  notes: WineNote[];
};

export const fetchWineNotes = async (
  wineId: number,
  includeUserState: boolean,
): Promise<WineNote[]> => {
  const response = await client.get<
    WineNotesResponse
  >(
    includeUserState
      ? wineNoteRoutes.mine(wineId)
      : wineNoteRoutes.list(wineId),
  );

  return response.data.notes;
};

export const addWineNote = async (
  wineId: number,
  text: string,
): Promise<WineNote> => {
  const response = await client.post<
    WineNote
  >(
    wineNoteRoutes.list(wineId),
    {
      text,
    },
  );

  return response.data;
};

export const toggleWineNote = async (
  wineId: number,
  noteId: number,
): Promise<WineNote> => {
  const response = await client.post<
    WineNote
  >(
    wineNoteRoutes.toggle(
      wineId,
      noteId,
    ),
  );

  return response.data;
};