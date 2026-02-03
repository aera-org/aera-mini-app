export interface Character {
  name: string;
  description?: string;
  bot_username?: string;
  is_active?: boolean;
  s3_files: {
    idle: {
      exists: boolean;
      key: string;
    };
    rub: {
      exists: boolean;
      key: string;
    };
    dance: {
      exists: boolean;
      key: string;
    };
    store_image: {
      key: string;
      exists: boolean;
    };
    store_image_transparent: {
      key: string;
      exists: boolean;
    };
  };
}

export interface CharactersResponse {
  success: boolean;
  data?: Character[];
  message?: string;
}
