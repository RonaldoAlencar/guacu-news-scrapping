export default function formatDate (date: Date): string {
  const formattedDate = date.toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour12: false,
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    year: "numeric",
    month: "numeric",
    day: "numeric"
  });
  return formattedDate;
}