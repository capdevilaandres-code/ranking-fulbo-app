import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Star, ClipboardList, Plus, Trash2, CalendarDays, Medal } from "lucide-react";

const initialPlayers = [
  { id: 1, ranking: 1, firstName: "ManuelJay", lastName: "Gimenez", positions: "DELANTERO", rating: 4.41, matches: 0, wins: 0, losses: 0, draws: 0 },
  { id: 2, ranking: 2, firstName: "Pedro", lastName: "YAYA", positions: "MEDIO", rating: 4.2, matches: 0, wins: 0, losses: 0, draws: 0 },
  { id: 3, ranking: 3, firstName: "Francisco", lastName: "CALVO", positions: "DEFENSOR/MEDIO/DELANTERO", rating: 4.0, matches: 0, wins: 0, losses: 0, draws: 0 },
  { id: 4, ranking: 4, firstName: "Nicolas", lastName: "MACCARI", positions: "MEDIO/DELANTERO", rating: 3.82, matches: 0, wins: 0, losses: 0, draws: 0 },
  { id: 5, ranking: 5, firstName: "Manuel", lastName: "CHIESA", positions: "DEFENSOR/LATERAL/MEDIO", rating: 3.73, matches: 0, wins: 0, losses: 0, draws: 0 },
  { id: 6, ranking: 6, firstName: "Ivo", lastName: "DEL FA", positions: "DELANTERO/MEDIO", rating: 3.51, matches: 0, wins: 0, losses: 0, draws: 0 },
  { id: 7, ranking: 7, firstName: "Ramiro", lastName: "FORCADA", positions: "DEFENSOR/MEDIO", rating: 3.33, matches: 0, wins: 0, losses: 0, draws: 0 },
  { id: 8, ranking: 8, firstName: "Gonzalo", lastName: "ESTRADA", positions: "LATERAL", rating: 3.29, matches: 0, wins: 0, losses: 0, draws: 0 },
  { id: 9, ranking: 9, firstName: "Donato", lastName: "BELLI", positions: "MEDIO", rating: 3.26, matches: 0, wins: 0, losses: 0, draws: 0 },
  { id: 10, ranking: 9, firstName: "Tomas", lastName: "PAPINI", positions: "DEFENSOR/MEDIO", rating: 3.26, matches: 0, wins: 0, losses: 0, draws: 0 },
  { id: 11, ranking: 11, firstName: "Arnaldo", lastName: "CENERE", positions: "MEDIO/LATERAL", rating: 3.16, matches: 0, wins: 0, losses: 0, draws: 0 },
  { id: 12, ranking: 12, firstName: "Andres", lastName: "CAPDEVILA", positions: "LATERAL", rating: 3.12, matches: 0, wins: 0, losses: 0, draws: 0 },
  { id: 13, ranking: 13, firstName: "Ignacio", lastName: "GUTIERREZ", positions: "LATERAL/MEDIO", rating: 3.1, matches: 0, wins: 0, losses: 0, draws: 0 },
  { id: 14, ranking: 14, firstName: "Julián", lastName: "DE LAS CARRERAS", positions: "LATERAL", rating: 2.85, matches: 0, wins: 0, losses: 0, draws: 0 },
  { id: 15, ranking: 15, firstName: "Nicolas", lastName: "CASTRO", positions: "LATERAL/MEDIO", rating: 2.78, matches: 0, wins: 0, losses: 0, draws: 0 },
  { id: 16, ranking: 16, firstName: "Manuel", lastName: "SOIZA", positions: "MEDIO/LATERAL", rating: 2.65, matches: 0, wins: 0, losses: 0, draws: 0 },
  { id: 17, ranking: 17, firstName: "Axel", lastName: "SANMARTINO", positions: "DEFENSOR/LATERAL", rating: 2.63, matches: 0, wins: 0, losses: 0, draws: 0 },
  { id: 18, ranking: 18, firstName: "Josue", lastName: "CARIDE", positions: "DELANTERO", rating: 2.52, matches: 0, wins: 0, losses: 0, draws: 0 },
  { id: 19, ranking: 19, firstName: "Francisco", lastName: "OTTONELLO", positions: "DELANTERO", rating: 1.78, matches: 0, wins: 0, losses: 0, draws: 0 },
];

function round2(n) {
  return Math.round(n * 100) / 100;
}

function fullName(player) {
  return `${player.firstName} ${player.lastName}`.trim();
}

function getWinPct(player) {
  return player.matches ? round2((player.wins / player.matches) * 100) : 0;
}

function average(values) {
  if (!values.length) return 0;
  return round2(values.reduce((a, b) => a + b, 0) / values.length);
}

function computeHistoricalRating(playerId, votesByMatch, fallbackRating) {
  const matchAverages = votesByMatch
    .map((record) => {
      const value = record.votes[playerId];
      return typeof value === "number" ? value : null;
    })
    .filter((v) => v !== null);

  if (!matchAverages.length) return fallbackRating;
  return round2(average(matchAverages));
}

function generateBalancedTeams(selectedPlayers) {
  if (selectedPlayers.length !== 10) return null;

  const ids = selectedPlayers.map((p) => p.id);
  let best = null;

  function combinations(arr, k, start = 0, current = [], result = []) {
    if (current.length === k) {
      result.push([...current]);
      return result;
    }
    for (let i = start; i < arr.length; i++) {
      current.push(arr[i]);
      combinations(arr, k, i + 1, current, result);
      current.pop();
    }
    return result;
  }

  const combos = combinations(ids, 5);
  const seen = new Set();

  for (const teamA of combos) {
    const sortedA = [...teamA].sort((a, b) => a - b);
    const teamB = ids.filter((id) => !teamA.includes(id)).sort((a, b) => a - b);
    const pairKey = [sortedA.join("-"), teamB.join("-")].sort().join("|");
    if (seen.has(pairKey)) continue;
    seen.add(pairKey);

    const totalA = round2(teamA.reduce((acc, id) => acc + selectedPlayers.find((p) => p.id === id).rating, 0));
    const totalB = round2(teamB.reduce((acc, id) => acc + selectedPlayers.find((p) => p.id === id).rating, 0));
    const diff = round2(Math.abs(totalA - totalB));

    if (!best || diff < best.diff) {
      best = { teamA, teamB, totalA, totalB, diff };
    }
  }

  return best;
}

export default function App() {
  const [players, setPlayers] = useState(initialPlayers);
  const [scheduledMatches, setScheduledMatches] = useState([]);
  const [matchResults, setMatchResults] = useState([]);
  const [votesByMatch, setVotesByMatch] = useState([]);

  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newPositions, setNewPositions] = useState("");
  const [newRating, setNewRating] = useState("3");

  const [selectedIds, setSelectedIds] = useState([]);
  const [generatedTeams, setGeneratedTeams] = useState(null);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTitle, setScheduledTitle] = useState("");

  const [resultMatchId, setResultMatchId] = useState("");
  const [winner, setWinner] = useState("");
  const [votes, setVotes] = useState({});
  const [bestPlayerId, setBestPlayerId] = useState("");

  const rankingHistorico = useMemo(() => {
    return [...players].sort((a, b) => b.rating - a.rating);
  }, [players]);

  const selectedPlayers = useMemo(() => players.filter((p) => selectedIds.includes(p.id)), [players, selectedIds]);

  const selectedScheduledMatch = useMemo(() => {
    return scheduledMatches.find((m) => String(m.id) === String(resultMatchId)) || null;
  }, [scheduledMatches, resultMatchId]);

  const currentMatchPlayers = useMemo(() => {
    if (!selectedScheduledMatch) return [];
    return [...selectedScheduledMatch.teamA, ...selectedScheduledMatch.teamB]
      .map((id) => players.find((p) => p.id === id))
      .filter(Boolean);
  }, [selectedScheduledMatch, players]);

  const rankingPorPartido = useMemo(() => {
    return [...matchResults]
      .sort((a, b) => new Date(b.dateISO) - new Date(a.dateISO))
      .map((match) => ({
        ...match,
        playerRatings: match.playerRatings
          .map((entry) => ({
            ...entry,
            player: players.find((p) => p.id === entry.playerId),
          }))
          .filter((entry) => entry.player),
      }));
  }, [matchResults, players]);

  const addPlayer = () => {
    if (!newFirstName.trim()) return;
    const next = {
      id: Date.now(),
      ranking: players.length + 1,
      firstName: newFirstName.trim(),
      lastName: newLastName.trim(),
      positions: newPositions.trim() || "-",
      rating: Number(newRating) || 3,
      matches: 0,
      wins: 0,
      losses: 0,
      draws: 0,
    };
    setPlayers((prev) => [...prev, next]);
    setNewFirstName("");
    setNewLastName("");
    setNewPositions("");
    setNewRating("3");
  };

  const removePlayer = (id) => {
    setPlayers((prev) => prev.filter((p) => p.id !== id));
    setSelectedIds((prev) => prev.filter((x) => x !== id));
  };

  const toggleSelected = (id) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 10) return prev;
      return [...prev, id];
    });
  };

  const buildTeams = () => {
    const result = generateBalancedTeams(selectedPlayers);
    setGeneratedTeams(result);
  };

  const scheduleMatch = () => {
    if (!generatedTeams || !scheduledDate) return;

    const newMatch = {
      id: Date.now(),
      title: scheduledTitle || `Partido ${scheduledDate}`,
      date: scheduledDate,
      dateISO: scheduledDate,
      teamA: generatedTeams.teamA,
      teamB: generatedTeams.teamB,
      totalA: generatedTeams.totalA,
      totalB: generatedTeams.totalB,
      diff: generatedTeams.diff,
      status: "Programado",
    };

    setScheduledMatches((prev) => [newMatch, ...prev]);
    setGeneratedTeams(null);
    setSelectedIds([]);
    setScheduledDate("");
    setScheduledTitle("");
  };

  const setVote = (playerId, value) => {
    setVotes((prev) => ({ ...prev, [playerId]: Number(value) }));
  };

  const saveResult = () => {
    if (!selectedScheduledMatch || !winner) return;

    const teamAIds = selectedScheduledMatch.teamA;
    const teamBIds = selectedScheduledMatch.teamB;

    const allVoteRecords = [...votesByMatch, { matchId: selectedScheduledMatch.id, votes }];

    const playerRatings = currentMatchPlayers.map((p) => {
      const voteAverage = typeof votes[p.id] === "number" ? votes[p.id] : null;
      const newRating = computeHistoricalRating(p.id, allVoteRecords, p.rating);
      return {
        playerId: p.id,
        previousRating: p.rating,
        voteAverage,
        newRating,
      };
    });

    setPlayers((prev) =>
      prev.map((p) => {
        if (![...teamAIds, ...teamBIds].includes(p.id)) return p;

        const updated = playerRatings.find((entry) => entry.playerId === p.id);
        const isA = teamAIds.includes(p.id);
        const playerWon = (winner === "A" && isA) || (winner === "B" && !isA);
        const playerLost = (winner === "A" && !isA) || (winner === "B" && isA);
        const playerDrew = winner === "EMPATE";

        return {
          ...p,
          rating: updated?.newRating ?? p.rating,
          matches: p.matches + 1,
          wins: p.wins + (playerWon ? 1 : 0),
          losses: p.losses + (playerLost ? 1 : 0),
          draws: p.draws + (playerDrew ? 1 : 0),
        };
      })
    );

    const resultRecord = {
      id: selectedScheduledMatch.id,
      bestPlayerId: bestPlayerId ? Number(bestPlayerId) : null,
      title: selectedScheduledMatch.title,
      date: selectedScheduledMatch.date,
      dateISO: selectedScheduledMatch.dateISO,
      winner,
      teamA: teamAIds,
      teamB: teamBIds,
      totalA: selectedScheduledMatch.totalA,
      totalB: selectedScheduledMatch.totalB,
      playerRatings,
    };

    const voteRecord = {
      matchId: selectedScheduledMatch.id,
      votes,
    };

    setMatchResults((prev) => [resultRecord, ...prev.filter((m) => m.id !== resultRecord.id)]);
    setVotesByMatch((prev) => [voteRecord, ...prev.filter((v) => v.matchId !== voteRecord.matchId)]);
    setScheduledMatches((prev) => prev.map((m) => (m.id === selectedScheduledMatch.id ? { ...m, status: "Jugado" } : m)));
    setResultMatchId("");
    setWinner("");
    setVotes({});
    setBestPlayerId("");
  };

  const teamAPlayers = generatedTeams ? generatedTeams.teamA.map((id) => players.find((p) => p.id === id)).filter(Boolean) : [];
  const teamBPlayers = generatedTeams ? generatedTeams.teamB.map((id) => players.find((p) => p.id === id)).filter(Boolean) : [];

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">App Ranking Fulbo</h1>
            <p className="text-sm text-slate-600">Jugadores, programación, votación, resultados, ranking por partido e histórico. El puntaje general se calcula como el promedio de los promedios obtenidos en cada partido jugado.</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Badge className="rounded-2xl px-3 py-1 text-sm"><Users className="mr-1 h-4 w-4" /> {players.length} jugadores</Badge>
            <Badge variant="secondary" className="rounded-2xl px-3 py-1 text-sm"><CalendarDays className="mr-1 h-4 w-4" /> {scheduledMatches.length} partidos</Badge>
            <Badge variant="secondary" className="rounded-2xl px-3 py-1 text-sm"><ClipboardList className="mr-1 h-4 w-4" /> {matchResults.length} resultados</Badge>
          </div>
        </div>

        <Tabs defaultValue="jugadores" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6 rounded-2xl">
            <TabsTrigger value="jugadores">Jugadores</TabsTrigger>
            <TabsTrigger value="programacion">Programación</TabsTrigger>
            <TabsTrigger value="votacion">Votación</TabsTrigger>
            <TabsTrigger value="resultado">Resultado</TabsTrigger>
            <TabsTrigger value="por-partido">Ranking partido</TabsTrigger>
            <TabsTrigger value="historico">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="jugadores">
            <div className="grid gap-4 lg:grid-cols-3">
              <Card className="rounded-3xl lg:col-span-2">
                <CardHeader>
                  <CardTitle>Listado de jugadores</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ranking</TableHead>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Posiciones</TableHead>
                        <TableHead>Puntaje</TableHead>
                        <TableHead>PJ</TableHead>
                        <TableHead>G</TableHead>
                        <TableHead>P</TableHead>
                        <TableHead>E</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rankingHistorico.map((p, i) => (
                        <TableRow key={p.id}>
                          <TableCell>{i + 1}</TableCell>
                          <TableCell className="font-medium">{fullName(p)}</TableCell>
                          <TableCell>{p.positions}</TableCell>
                          <TableCell>{p.rating.toFixed(2)}</TableCell>
                          <TableCell>{p.matches}</TableCell>
                          <TableCell>{p.wins}</TableCell>
                          <TableCell>{p.losses}</TableCell>
                          <TableCell>{p.draws}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card className="rounded-3xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Plus className="h-5 w-5" /> Agregar jugador</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label>Nombre</Label>
                    <Input className="rounded-2xl" value={newFirstName} onChange={(e) => setNewFirstName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Apellido</Label>
                    <Input className="rounded-2xl" value={newLastName} onChange={(e) => setNewLastName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Posiciones</Label>
                    <Input className="rounded-2xl" value={newPositions} onChange={(e) => setNewPositions(e.target.value)} placeholder="DEFENSOR/MEDIO" />
                  </div>
                  <div className="space-y-2">
                    <Label>Puntaje inicial</Label>
                    <Input className="rounded-2xl" value={newRating} onChange={(e) => setNewRating(e.target.value)} type="number" step="0.01" min="1" max="5" />
                  </div>
                  <Button className="w-full rounded-2xl" onClick={addPlayer}>Agregar</Button>
                </CardContent>
              </Card>
            </div>

            <Card className="rounded-3xl mt-4">
              <CardHeader>
                <CardTitle>Administrar jugadores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {players.map((p) => (
                    <div key={p.id} className="flex items-center justify-between rounded-2xl border p-3">
                      <div>
                        <div className="font-medium">{fullName(p)}</div>
                        <div className="text-sm text-slate-500">{p.positions} · Rating {p.rating.toFixed(2)} · {p.matches} PJ</div>
                      </div>
                      <Button variant="outline" className="rounded-2xl" onClick={() => removePlayer(p.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="programacion">
            <div className="grid gap-4 lg:grid-cols-3">
              <Card className="rounded-3xl lg:col-span-1">
                <CardHeader>
                  <CardTitle>Quiénes juegan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm text-slate-600">Elegidos: {selectedIds.length}/10</div>
                  <div className="max-h-[420px] space-y-2 overflow-auto pr-1">
                    {players.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => toggleSelected(p.id)}
                        className={`w-full rounded-2xl border p-3 text-left transition ${selectedIds.includes(p.id) ? "border-slate-900 bg-slate-900 text-white" : "bg-white hover:bg-slate-50"}`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-medium">{fullName(p)}</span>
                          <span>{p.rating.toFixed(2)}</span>
                        </div>
                        <div className={`text-xs ${selectedIds.includes(p.id) ? "text-slate-200" : "text-slate-500"}`}>{p.positions}</div>
                      </button>
                    ))}
                  </div>
                  <Button className="w-full rounded-2xl" onClick={buildTeams} disabled={selectedIds.length !== 10}>Armar equipos parejos</Button>
                </CardContent>
              </Card>

              <Card className="rounded-3xl lg:col-span-2">
                <CardHeader>
                  <CardTitle>Programación del partido</CardTitle>
                </CardHeader>
                <CardContent>
                  {!generatedTeams ? (
                    <div className="rounded-2xl border border-dashed p-8 text-center text-slate-500">Seleccioná 10 jugadores para generar el partido.</div>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-3xl bg-slate-100 p-4">
                          <div className="mb-2 text-lg font-semibold">Negro</div>
                          <div className="space-y-2">
                            {teamAPlayers.map((p) => (
                              <div key={p.id} className="flex justify-between rounded-2xl bg-white px-3 py-2">
                                <span>{fullName(p)}</span>
                                <span>{p.rating.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 font-semibold">Total: {generatedTeams.totalA.toFixed(2)}</div>
                        </div>
                        <div className="rounded-3xl bg-slate-100 p-4">
                          <div className="mb-2 text-lg font-semibold">Blanco</div>
                          <div className="space-y-2">
                            {teamBPlayers.map((p) => (
                              <div key={p.id} className="flex justify-between rounded-2xl bg-white px-3 py-2">
                                <span>{fullName(p)}</span>
                                <span>{p.rating.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 font-semibold">Total: {generatedTeams.totalB.toFixed(2)}</div>
                        </div>
                      </div>

                      <div className="rounded-2xl border p-4 text-sm">
                        Diferencia: <span className="font-semibold">{generatedTeams.diff.toFixed(2)}</span>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Título del partido</Label>
                          <Input className="rounded-2xl" value={scheduledTitle} onChange={(e) => setScheduledTitle(e.target.value)} placeholder="Ej: Martes 21 hs" />
                        </div>
                        <div className="space-y-2">
                          <Label>Fecha</Label>
                          <Input className="rounded-2xl" type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} />
                        </div>
                      </div>

                      <Button className="rounded-2xl" onClick={scheduleMatch} disabled={!scheduledDate}>Programar partido</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="rounded-3xl mt-4">
              <CardHeader>
                <CardTitle>Partidos programados</CardTitle>
              </CardHeader>
              <CardContent>
                {scheduledMatches.length === 0 ? (
                  <div className="text-slate-500">Todavía no hay partidos programados.</div>
                ) : (
                  <div className="space-y-3">
                    {scheduledMatches.map((m) => (
                      <div key={m.id} className="rounded-2xl border p-4 flex items-center justify-between gap-4">
                        <div>
                          <div className="font-semibold">{m.title}</div>
                          <div className="text-sm text-slate-500">{m.date} · Negro {m.totalA.toFixed(2)} vs Blanco {m.totalB.toFixed(2)} · Dif {m.diff.toFixed(2)}</div>
                        </div>
                        <Badge className="rounded-2xl">{m.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="votacion">
            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle>Votación partido a partido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 max-w-md">
                  <Label>Elegir partido</Label>
                  <Select value={resultMatchId} onValueChange={setResultMatchId}>
                    <SelectTrigger className="rounded-2xl">
                      <SelectValue placeholder="Seleccionar partido" />
                    </SelectTrigger>
                    <SelectContent>
                      {scheduledMatches.map((m) => (
                        <SelectItem key={m.id} value={String(m.id)}>{m.title} · {m.date}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {!selectedScheduledMatch ? (
                  <div className="text-slate-500">Elegí un partido para cargar las notas de 1 a 5.</div>
                ) : (
                  <div className="grid gap-3 md:grid-cols-2">
                    {currentMatchPlayers.map((p) => (
                      <div key={p.id} className="rounded-2xl border p-3">
                        <div className="mb-2 font-medium">{fullName(p)}</div>
                        <div className="mb-2 text-sm text-slate-500">Rating actual {p.rating.toFixed(2)}</div>
                        <Select value={votes[p.id]?.toString() || ""} onValueChange={(v) => setVote(p.id, v)}>
                          <SelectTrigger className="rounded-2xl">
                            <SelectValue placeholder="Puntaje 1 a 5" />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5].map((n) => (
                              <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resultado">
            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle>Carga de resultado</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Partido</Label>
                    <Select value={resultMatchId} onValueChange={setResultMatchId}>
                      <SelectTrigger className="rounded-2xl">
                        <SelectValue placeholder="Seleccionar partido" />
                      </SelectTrigger>
                      <SelectContent>
                        {scheduledMatches.map((m) => (
                          <SelectItem key={m.id} value={String(m.id)}>{m.title} · {m.date}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Resultado</Label>
                    <Select value={winner} onValueChange={setWinner}>
                      <SelectTrigger className="rounded-2xl">
                        <SelectValue placeholder="Elegir resultado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">Ganó Negro</SelectItem>
                        <SelectItem value="B">Ganó Blanco</SelectItem>
                        <SelectItem value="EMPATE">Empate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Mejor del partido</Label>
                    <Select value={bestPlayerId} onValueChange={setBestPlayerId}>
                      <SelectTrigger className="rounded-2xl">
                        <SelectValue placeholder="Elegir jugador" />
                      </SelectTrigger>
                      <SelectContent>
                        {currentMatchPlayers.map((p) => (
                          <SelectItem key={p.id} value={String(p.id)}>{fullName(p)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {selectedScheduledMatch ? (
                  <div className="rounded-2xl border p-4 text-sm">
                    <div className="font-medium mb-1">{selectedScheduledMatch.title}</div>
                    <div className="text-slate-500">Negro {selectedScheduledMatch.totalA.toFixed(2)} vs Blanco {selectedScheduledMatch.totalB.toFixed(2)}</div>
                    <div className="text-slate-500">Promedio votos cargados: {average(Object.values(votes).map(Number).filter((v) => !Number.isNaN(v) && v > 0)).toFixed(2)}</div>
                    <div className="text-slate-500">El puntaje general nuevo se calcula como promedio de los promedios recibidos en todos los partidos jugados.</div>
                  </div>
                ) : null}

                <Button className="rounded-2xl" onClick={saveResult} disabled={!selectedScheduledMatch || !winner}>Guardar resultado y actualizar ranking</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="por-partido">
            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Medal className="h-5 w-5" /> Ranking por partido</CardTitle>
              </CardHeader>
              <CardContent>
                {rankingPorPartido.length === 0 ? (
                  <div className="text-slate-500">Todavía no hay rankings por partido.</div>
                ) : (
                  <div className="space-y-6">
                    {rankingPorPartido.map((match) => (
                      <div key={match.id} className="rounded-2xl border p-4">
                        <div className="mb-3 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                          <div>
                            <div className="font-semibold">{match.title}</div>
                            <div className="text-sm text-slate-500">{match.date} · {match.winner === "A" ? "Ganó Negro" : match.winner === "B" ? "Ganó Blanco" : "Empate"}</div>
                            {match.bestPlayerId ? (
                              <div className="text-sm text-slate-500">Mejor del partido: {fullName(players.find((p) => p.id === match.bestPlayerId) || { firstName: "-", lastName: "" })}</div>
                            ) : null}
                          </div>
                        </div>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Jugador</TableHead>
                              <TableHead>Puntaje previo</TableHead>
                              <TableHead>Promedio partido</TableHead>
                              <TableHead>Puntaje histórico nuevo</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {match.playerRatings.sort((a, b) => (b.voteAverage || 0) - (a.voteAverage || 0)).map((entry) => (
                              <TableRow key={entry.playerId}>
                                <TableCell className="font-medium">{fullName(entry.player)}</TableCell>
                                <TableCell>{entry.previousRating.toFixed(2)}</TableCell>
                                <TableCell>{entry.voteAverage ? Number(entry.voteAverage).toFixed(2) : "-"}</TableCell>
                                <TableCell>{entry.newRating.toFixed(2)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="historico">
            <div className="grid gap-4 lg:grid-cols-3">
              <Card className="rounded-3xl lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Star className="h-5 w-5" /> Ranking histórico</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Jugador</TableHead>
                        <TableHead>Posiciones</TableHead>
                        <TableHead>Puntaje</TableHead>
                        <TableHead>PJ</TableHead>
                        <TableHead>G</TableHead>
                        <TableHead>P</TableHead>
                        <TableHead>E</TableHead>
                        <TableHead>% victorias</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rankingHistorico.map((p, i) => (
                        <TableRow key={p.id}>
                          <TableCell>{i + 1}</TableCell>
                          <TableCell className="font-medium">{fullName(p)}</TableCell>
                          <TableCell>{p.positions}</TableCell>
                          <TableCell>{p.rating.toFixed(2)}</TableCell>
                          <TableCell>{p.matches}</TableCell>
                          <TableCell>{p.wins}</TableCell>
                          <TableCell>{p.losses}</TableCell>
                          <TableCell>{p.draws}</TableCell>
                          <TableCell>{getWinPct(p).toFixed(2)}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card className="rounded-3xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5" /> Resumen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="rounded-2xl bg-slate-100 p-4">
                    <div className="text-slate-500">Mejor rankeado</div>
                    <div className="text-lg font-semibold">{rankingHistorico[0] ? fullName(rankingHistorico[0]) : "-"}</div>
                    <div>{rankingHistorico[0]?.rating?.toFixed(2) || "-"}</div>
                  </div>
                  <div className="rounded-2xl bg-slate-100 p-4">
                    <div className="text-slate-500">Más ganador</div>
                    <div className="text-lg font-semibold">{players.length ? fullName([...players].sort((a, b) => b.wins - a.wins)[0]) : "-"}</div>
                    <div>{players.length ? [...players].sort((a, b) => b.wins - a.wins)[0].wins : 0} victorias</div>
                  </div>
                  <div className="rounded-2xl bg-slate-100 p-4">
                    <div className="text-slate-500">Jugador con más MVP</div>
                    <div className="text-lg font-semibold">{(() => {
                      const counts = matchResults.reduce((acc, match) => {
                        if (match.bestPlayerId) acc[match.bestPlayerId] = (acc[match.bestPlayerId] || 0) + 1;
                        return acc;
                      }, {});
                      const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
                      if (!top) return "-";
                      const player = players.find((p) => p.id === Number(top[0]));
                      return player ? fullName(player) : "-";
                    })()}</div>
                    <div>{(() => {
                      const counts = matchResults.reduce((acc, match) => {
                        if (match.bestPlayerId) acc[match.bestPlayerId] = (acc[match.bestPlayerId] || 0) + 1;
                        return acc;
                      }, {});
                      const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
                      return top ? `${top[1]} MVP` : "Sin datos";
                    })()}</div>
                  </div>
                  <div className="rounded-2xl bg-slate-100 p-4">
                    <div className="text-slate-500">Promedio general actual</div>
                    <div className="text-lg font-semibold">{average(players.map((p) => p.rating)).toFixed(2)}</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
