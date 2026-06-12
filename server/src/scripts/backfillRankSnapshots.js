import 'dotenv/config';
import { connectDB } from '../config/db.js';
import Match from '../models/Match.js';
import RankSnapshot from '../models/RankSnapshot.js';
import { snapshotLeaderboardRanks } from '../services/rankSnapshot.js';

async function backfill() {
  await connectDB();

  await RankSnapshot.deleteMany({});

  const finishedMatches = await Match.find({ status: 'finished' }).sort({ startTime: 1 });

  for (const match of finishedMatches) {
    await snapshotLeaderboardRanks(match._id);
    console.log(`Snapshotted ranks after: ${match.teamA} vs ${match.teamB}`);
  }

  console.log(`Done. Processed ${finishedMatches.length} finished matches.`);
  process.exit(0);
}

backfill().catch((err) => {
  console.error(err);
  process.exit(1);
});
