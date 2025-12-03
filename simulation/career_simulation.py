import pandas as pd
import numpy as np
import sys


class CohortSimulation:
    def __init__(self, luck_factor=0.0, target_samples=10000):
        # Total capacity at each level
        self.capacity = {1: 1875, 2: 375, 3: 75, 4: 15, 5: 3}

        self.luck_factor = luck_factor
        self.rng = np.random.default_rng(42)
        self.target_samples = target_samples
        self.max_turns_per_piece = 4
        self.next_piece_id = 0

        # Probe definitions
        self.probe_definitions = {
            "median": 0.50,
            "top_25": 0.75,
            "top_10": 0.90,
            "top_75": 0.25,
            "top_1": 1.0
        }

        # Probe data storage
        self.collected_data = {k: [] for k in self.probe_definitions}
        self.collected_counts = {k: 0 for k in self.probe_definitions}

        # Global population stats
        self.global_outcomes = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}

        # Initial configuration scaled by 3×
        self.initial_config = [
            (5, {4: 3}),
            (4, {4: 12, 3: 3}),
            (3, {4: 54, 3: 15, 2: 6}),
            (2, {1: 45, 2: 87, 3: 87, 4: 156}),
            (1, {0: 450, 1: 414, 2: 375, 3: 336, 4: 300}),
        ]

    def _create_agent(self, level, age, fixed_merit=None, agent_type="random"):
        merit = self.rng.random() if fixed_merit is None else fixed_merit
        return {
            "id": self.next_piece_id,
            "level": level,
            "age": age,
            "base_merit": merit,
            "type": agent_type,
            "history": [level],
            "active": True
        }

    def run_until_target_met(self):
        # 1. Initialize population
        agents = []
        for level, age_counts in self.initial_config:
            for age, count in age_counts.items():
                for _ in range(count):
                    agent = self._create_agent(level, age)
                    agent["id"] = self.next_piece_id
                    self.next_piece_id += 1
                    agents.append(agent)

        turn_count = 0

        # Run until every probe type has at least target_samples
        while any(self.collected_counts[k] < self.target_samples for k in self.probe_definitions):
            turn_count += 1

            active_agents = [a for a in agents if a["active"]]
            survivors = []

            # A. Attrition & Data Collection
            for agent in active_agents:
                if agent["age"] >= self.max_turns_per_piece:
                    agent["active"] = False

                    # Track global stats
                    self.global_outcomes[agent["level"]] += 1

                    # Track probes
                    if agent["type"] in self.probe_definitions:
                        if self.collected_counts[agent["type"]] < self.target_samples:
                            self.collected_data[agent["type"]].append({
                                "id": agent["id"],
                                "base_merit": agent["base_merit"],
                                "history": list(agent["history"])
                            })
                            self.collected_counts[agent["type"]] += 1
                else:
                    agent["age"] += 1
                    survivors.append(agent)

            # B. Dynamic promotion logic
            levels = {1: [], 2: [], 3: [], 4: [], 5: []}
            for a in survivors:
                levels[a["level"]].append(a)

            current_counts = {l: len(levels[l]) for l in range(1, 6)}

            for lvl in range(5, 1, -1):
                vacancies = self.capacity[lvl] - current_counts[lvl]
                if vacancies > 0:
                    candidates = levels[lvl - 1]
                    if not candidates:
                        continue

                    cand_scores = []
                    for cand in candidates:
                        noise = self.rng.random()
                        score = (cand["base_merit"] * (1 - self.luck_factor)) + (noise * self.luck_factor)
                        cand_scores.append(((score, cand["age"]), cand))

                    # Sort by score then age (desc)
                    cand_scores.sort(key=lambda x: x[0], reverse=True)
                    winners = cand_scores[:vacancies]

                    for _, winner in winners:
                        winner["level"] = lvl
                        current_counts[lvl] += 1
                        current_counts[lvl - 1] -= 1

            # Update history
            for agent in survivors:
                agent["history"].append(agent["level"])

            # C. Refill Level 1
            l1_vacancies = self.capacity[1] - current_counts[1]
            new_hires = []

            if l1_vacancies > 0:
                standard_probes = ["median", "top_25", "top_10", "top_75", "top_1"]

                # Inject probe agents if needed
                for p_type in standard_probes:
                    if self.collected_counts[p_type] < self.target_samples:
                        if len(new_hires) < l1_vacancies:
                            merit_val = self.probe_definitions[p_type]
                            new_hires.append(
                                self._create_agent(1, 0, fixed_merit=merit_val, agent_type=p_type)
                            )

                # Fill remaining vacancies with random hires
                while len(new_hires) < l1_vacancies:
                    new_hires.append(self._create_agent(1, 0))

                for new_agent in new_hires:
                    new_agent["id"] = self.next_piece_id
                    self.next_piece_id += 1

            agents = survivors + new_hires

            if turn_count > 100000:
                break

        return self.collected_data


# --- EXECUTION ---

scenarios_config = [
    {"name": "100% Meritocracy", "luck": 0.0},
    {"name": "25% Luck",        "luck": 0.25},
    {"name": "50/50 Split",     "luck": 0.5},
    {"name": "75% Luck",        "luck": 0.75},
    {"name": "100% Luck",       "luck": 1.0}
]

agent_labels = {
    "median": "Median Performer (50th)",
    "top_25": "Top 25th Percentile",
    "top_10": "Top 10th Percentile",
    "top_1":  "Top 1",
    "top_75": "Lower 25th Percentile"
}

flat_rows = []
global_rows = []
target_per_profile = 10000

for scen in scenarios_config:
    sim = CohortSimulation(luck_factor=scen["luck"], target_samples=target_per_profile)
    results = sim.run_until_target_met()

    # Global outcome export
    total_retirees = sum(sim.global_outcomes.values())
    for lvl in range(1, 6):
        count = sim.global_outcomes[lvl]
        pct = (count / total_retirees * 100) if total_retirees > 0 else 0.0
        global_rows.append({
            "Scenario": scen["name"],
            "Luck_Factor": scen["luck"],
            "Level": lvl,
            "Retiree_Count": count,
            "Retiree_Percent": pct
        })

    # Per-agent histories
    for agent_type, agents_data in results.items():
        label = agent_labels.get(agent_type, agent_type)
        for agent in agents_data:
            history = agent["history"]
            base_merit = agent["base_merit"]

            for age, level in enumerate(history):
                if age <= 4:
                    flat_rows.append({
                        "Scenario": scen["name"],
                        "Luck_Factor": scen["luck"],
                        "Agent_Type": label,
                        "Base_Merit": base_merit,
                        "Sim_Agent_ID": f"{scen['luck']}-{agent['id']}",
                        "Age": age,
                        "Level": level
                    })

# --- Export per-agent histories ---
df_export = pd.DataFrame(flat_rows)
filename = "per_agent_histories.csv"
df_export.to_csv(filename, index=False)
print(f"Success. Generated {len(df_export)} rows.")
print(f"Data saved to {filename}")

# --- Export global outcomes ---
df_global = pd.DataFrame(global_rows)
global_filename = "global_outcomes.csv"
df_global.to_csv(global_filename, index=False)
print(f"Success. Generated {len(df_global)} global outcome rows.")
print(f"Global outcomes saved to {global_filename}")
