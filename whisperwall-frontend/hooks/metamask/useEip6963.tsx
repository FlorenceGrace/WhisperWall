"use client";

import { useEffect, useState } from "react";
import type { EIP6963ProviderDetail } from "./Eip6963Types";

export function useEip6963() {
  const [providers, setProviders] = useState<
    Map<string, EIP6963ProviderDetail>
  >(new Map());

  useEffect(() => {
    const providerMap = new Map<string, EIP6963ProviderDetail>();

    function handleAnnouncement(event: Event) {
      const customEvent = event as CustomEvent<EIP6963ProviderDetail>;
      const { info, provider } = customEvent.detail;
      providerMap.set(info.uuid, { info, provider });
      setProviders(new Map(providerMap));
    }

    window.addEventListener(
      "eip6963:announceProvider",
      handleAnnouncement as EventListener
    );

    window.dispatchEvent(new Event("eip6963:requestProvider"));

    return () => {
      window.removeEventListener(
        "eip6963:announceProvider",
        handleAnnouncement as EventListener
      );
    };
  }, []);

  return { providers };
}


