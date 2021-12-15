const textEncoder = new TextEncoder(); // UTF-8 is default

export const toByteArray = (str: string): Uint8Array => {
    return textEncoder.encode(str);
};
