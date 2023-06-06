type APIResponseSuccess = {
    success: true,
    messages: Message[],
};

type APIResponseFailure = {
    success: false,
};

export type APIResponse<Success extends boolean | undefined = undefined> = Success extends undefined ?
    APIResponseSuccess | APIResponseFailure :
    (
        Success extends false ?
        APIResponseFailure :
        APIResponseSuccess
    );


export interface Root {
    type: number;
    invocationId: string;
    item: Item;
}

export interface Item {
    messages: Message[];
    firstNewMessageIndex: number;
    conversationId: string;
    requestId: string;
    conversationExpiryTime: string;
    shouldInitiateConversation: boolean;
    telemetry: Telemetry;
    throttling: Throttling;
    result: Result;
}

export interface Message {
    text: string;
    author: string;
    from?: From;
    createdAt: string;
    timestamp: string;
    locale?: string;
    market?: string;
    region?: string;
    messageId: string;
    requestId: string;
    nlu?: Nlu;
    offense: string;
    feedback: Feedback;
    contentOrigin: string;
    privacy: any;
    inputMethod?: string;
    adaptiveCards?: AdaptiveCard[];
    sourceAttributions?: SourceAttribution[];
    suggestedResponses?: SuggestedResponse[];
    spokenText?: string;
}

export interface From {
    id: string;
    name: any;
}

export interface Nlu {
    scoredClassification: ScoredClassification;
    classificationRanking: ClassificationRanking[];
    qualifyingClassifications: any;
    ood: any;
    metaData: any;
    entities: any;
}

export interface ScoredClassification {
    classification: string;
    score: any;
}

export interface ClassificationRanking {
    classification: string;
    score: any;
}

export interface Feedback {
    tag: any;
    updatedOn: any;
    type: string;
}

export interface AdaptiveCard {
    type: string;
    version: string;
    body: Body[];
}

export interface Body {
    type: string;
    text: string;
    wrap: boolean;
    size?: string;
}

export interface SourceAttribution {
    providerDisplayName: string;
    seeMoreUrl: string;
    searchQuery: string;
    imageLink?: string;
    imageWidth?: string;
    imageHeight?: string;
    imageFavicon?: string;
}

export interface SuggestedResponse {
    text: string;
    author: string;
    createdAt: string;
    timestamp: string;
    messageId: string;
    messageType: string;
    offense: string;
    feedback: Feedback2;
    contentOrigin: string;
    privacy: any;
}

export interface Feedback2 {
    tag: any;
    updatedOn: any;
    type: string;
}

export interface Telemetry {
    metrics: any;
    startTime: string;
}

export interface Throttling {
    maxNumUserMessagesInConversation: number;
    numUserMessagesInConversation: number;
}

export interface Result {
    value: string;
    serviceVersion: string;
}
