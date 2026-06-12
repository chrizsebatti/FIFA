export function getMatchPredictUrl(matchId) {
  return `${window.location.origin}/matches/${matchId}/predict#predict`;
}

export function getMatchShareMessage(match) {
  const url = getMatchPredictUrl(match._id);
  const fixture = `${match.teamA} vs ${match.teamB}`;
  const stage = match.stage ? ` (${match.stage})` : '';
  const text = `Predict ${fixture}${stage} in FIFA WC 2026!`;
  return { url, text, title: fixture };
}

export async function shareMatch(match) {
  const { url, text, title } = getMatchShareMessage(match);

  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return 'shared';
    } catch (err) {
      if (err?.name === 'AbortError') return 'cancelled';
    }
  }

  await navigator.clipboard.writeText(`${text}\n${url}`);
  return 'copied';
}
