﻿function __concat(stra, strb) {
    stra = stra | 0;
    strb = strb | 0;
    var alen = 0;
    var blen = 0;
    var clen = 0;
    var strc = 0;
    var ptr = 0;
    var ptrc = 0;

    // Test that the strings are defined
    // Otherwise the values default to 0
    if (stra | 0)
        alen = MEMS32[(stra | 0) >> 2] | 0;
    if (strb | 0)
        blen = MEMS32[(strb | 0) >> 2] | 0;

    // Compute the combined length
    clen = (alen + blen) | 0;
    // And reserve the resulting string
    strc = __memreserve((clen + (STRING_HEADER_LENGTH | 0)) | 0) | 0;
    // Find a pointer to the payload of the result
    ptrc = (strc + (STRING_HEADER_LENGTH | 0)) | 0;
    // And then for the input
    ptr = (stra + (STRING_HEADER_LENGTH | 0)) | 0;
    // Save the length of the new string
    MEMS32[(strc | 0) >> 2] = clen | 0;

    // Copy a to the c
    while (alen | 0) {
        MEMU8[(ptrc | 0) >> 0] = MEMU8[(ptr | 0) >> 0];
        ptrc = (ptrc + 1) | 0;
        ptr = (ptr + 1) | 0;
        alen = (alen - 1) | 0;
    }

    // And then b
    ptr = (strb + (STRING_HEADER_LENGTH | 0)) | 0;
    while (blen | 0) {
        MEMU8[(ptrc | 0) >> 0] = MEMU8[(ptr | 0) >> 0];
        ptrc = (ptrc + 1) | 0;
        ptr = (ptr + 1) | 0;
        blen = (blen - 1) | 0;
    }

    // Finally just return the result
    return strc | 0;
}

function __streq(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0;      // Iterator end

    if (!(a | 0)) {
        // a is empty
        if (!(b | 0))
            return 1;           // Both are empty
        if (MEMS32[b >> 2] | 0)
            return 0;           // b is not empty
        return 1;               // b is empty
    }
    if (!(b | 0)) {
        // b is empty
        if (MEMS32[a >> 2] | 0)
            return 0;           // a is not empty
        return 1;               // a is empty
    }

    // Test that the lengths are the same
    if (((MEMS32[a >> 2] | 0) != (MEMS32[b >> 2] | 0)) | 0)
        return 0;
    c = ((MEMS32[a >> 2] | 0) + a + STRING_HEADER_LENGTH) | 0;

    for (; ((a | 0) < (c | 0)) | 0; a = (a + 1) | 0, b = (b + 1) | 0)
        if (((MEMU8[a >> 0] | 0) != (MEMU8[b >> 0] | 0)) | 0)
            return 0;

    return 1;
}

function __strneq(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0;
    var d = 0;
    c = __streq(a, b) | 0;
    d = (1 - c) | 0;
    return d | 0;
}

function __strasc(a) {
    a = a | 0;
    var len = 0;
    var i = 0;
    var char = 0;
    var end = 0;

    if (!(a | 0))
        return -1;          // No string

    // Get the length of the string
    len = MEMS32[a >> 2] | 0;
    if (!(len | 0))
        return -1;          // The string is empty

    // A pointer to the end of the string
    end = (a + 4 + len) | 0;

    // Get the first bytes of the char
    a = (a + 4) | 0;
    char = MEMU8[a | 0] | 0;
    // Remove the uppermost bits
    for (i = 7; ((i | 0) >= 0) | 0; i = (i - 1) | 0) {
        if (!(char & ((1 << (i | 0)) | 0)))
            break;
        char = char ^ ((1 << (i | 0)) | 0);
    }
    a = (a + 1) | 0;

    while (
        (((a | 0) < (end | 0)) | 0)         // Not at the end of the string
        & (MEMU8[a | 0] & 0x80)             // The next byte is extending char
        & !(MEMU8[a | 0] & 0x40)) {         // And is not the start of the next char
        char = (char << 6) | (MEMU8[a | 0] & 0x3f);
        a = (a + 1) | 0;
    }

    return char | 0;
}