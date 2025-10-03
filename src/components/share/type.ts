export interface CaptureResult {
  sticker?: string;
  backgroundImage?: string;
  backgroundTopColor?: string;
  backgroundBottomColor?: string;
  backgroundVideo?: string;
}

export interface ShareViewRef {
  capture: (options?: {
    background?: {
      ratio?: number;
    }
  }) => Promise<CaptureResult>;
}
