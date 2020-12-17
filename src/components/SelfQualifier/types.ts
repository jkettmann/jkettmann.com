export type Pain = {
  value: string;
  label: string;
  description: string;
}

export interface UseSelfQualifierReturn {
  selectedPain: Pain | undefined;
  setPain: (pain: string | null) => void;
}

export interface SelfQualifierProps extends UseSelfQualifierReturn {
  pains: Array<Pain>;
}