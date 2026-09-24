/**
 * Phone dimensions in model units, shared by the 3D phones (device/) and the
 * particle outlines that form them (shapes.ts). Phone-local space: centred on
 * the phone, +y up, +z out of the screen, front glass at z = +DEPTH / 2.
 */
export const PHONE_H = 2.8;
export const BEZEL = 0.07;
export const SCREEN_H = PHONE_H - BEZEL * 2;
// The screen has exactly the screenshots' aspect (921 x 2000), so nothing is cropped.
export const SCREEN_W = SCREEN_H * (921 / 2000);
export const PHONE_W = SCREEN_W + BEZEL * 2;
export const DEPTH = 0.15;
export const CORNER = 0.2;
export const SCREEN_CORNER = CORNER - BEZEL;
