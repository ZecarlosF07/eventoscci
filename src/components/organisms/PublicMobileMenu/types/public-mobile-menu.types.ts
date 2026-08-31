import type { RefObject } from "react";

import type { PublicHeaderAccount, PublicHeaderTone } from "@/components/organisms/PublicHeader/types/public-header.types";

export interface PublicMobileMenuProps {
  account: PublicHeaderAccount | null;
  closeButtonRef: RefObject<HTMLButtonElement | null>;
  isOpen: boolean;
  menuButtonRef: RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  onOpen: () => void;
  panelRef: RefObject<HTMLElement | null>;
  tone: PublicHeaderTone;
}
