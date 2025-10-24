/**
 * Koleksi komponen UI reusable dengan dukungan varian terbaru:
 * - `AppButton` varian: `primary`, `secondary`, `danger`, `outline`, `pastel`.
 * - `InfoCard` varian: `flat`, `elevated`, `info`, `nutrient`, `pastel`.
 * - `ChatBubble` varian/role: `ibu`, `pakar`, `system`, `user`, `mentor`.
 * - `AppTextInput` kini meng-highlight fokus/error secara otomatis.
 * - `AuthLayout` untuk membungkus form autentikasi bernuansa pastel.
 */
export { AppButton } from './AppButton';
export type { AppButtonVariant } from './AppButton';
export { AppTextInput } from './AppTextInput';
export { InfoCard } from './InfoCard';
export type { InfoCardVariant } from './InfoCard';
export { AuthLayout } from './AuthLayout';
export { ChatBubble } from './ChatBubble';
export type { ChatBubbleDirection, ChatBubbleVariant } from './ChatBubble';
export { Loading } from './Loading';
export type { LoadingSize } from './Loading';
