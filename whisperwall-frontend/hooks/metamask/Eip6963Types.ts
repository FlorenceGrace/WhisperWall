import type { Eip1193Provider } from "ethers";

export interface EIP6963ProviderInfo {
  uuid: string;
  name: string;
  icon: string;
  rdns: string;
}

export interface EIP6963ProviderDetail {
  info: EIP6963ProviderInfo;
  provider: Eip1193Provider;
}

export type EIP6963AnnounceProviderEvent = {
  detail: EIP6963ProviderDetail;
};


