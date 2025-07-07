declare module 'azure-maps-control' {
  export = atlas;
}

declare namespace atlas {
  export enum AuthenticationType {
    subscriptionKey = 'subscriptionKey',
    aad = 'aad',
    anonymous = 'anonymous'
  }

  export interface AuthenticationOptions {
    authType: AuthenticationType;
    subscriptionKey?: string;
    clientId?: string;
    aadAppId?: string;
    aadTenant?: string;
    aadInstance?: string;
  }

  export interface MapOptions {
    center?: number[];
    zoom?: number;
    language?: string;
    authOptions: AuthenticationOptions;
  }

  export class Map {
    constructor(container: HTMLElement | string, options: MapOptions);
    events: {
      add(eventType: string, callback: () => void): void;
    };
    markers: {
      add(marker: HtmlMarker): void;
    };
    popups: {
      add(popup: Popup): void;
    };
    dispose(): void;
  }

  export interface HtmlMarkerOptions {
    color?: string;
    text?: string;
    position: number[];
  }

  export class HtmlMarker {
    constructor(options: HtmlMarkerOptions);
  }

  export interface PopupOptions {
    content: string;
    position: number[];
  }

  export class Popup {
    constructor(options: PopupOptions);
  }
}
