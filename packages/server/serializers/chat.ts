export default function chatSerializer(message: string): boolean {
  return Boolean(message.trim().length);
}
