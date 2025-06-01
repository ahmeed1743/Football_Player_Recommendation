# ⚽ Football Player Recommendation System

An AI-powered football scouting and recommendation platform designed to help coaches, scouts, and analysts identify, compare, and evaluate football talent across 169 parameters. This web app automates player reports, provides team recommendations, and enables data-driven decision-making in football recruitment.

🌐 [Live Website](https://ahmeed1743.github.io/Football_Player_Recommendation/)

## 📌 Key Features

- 🔍 **Advanced Player Search** — Filter and shortlist players by position, age, league, and specific metrics.
- 📊 **Data-Driven Analysis** — Evaluate players using statistical comparisons across 169 attributes.
- 🤖 **AI-Generated Reports** — Automatically generate scouting reports using Generative AI.
- 🧠 **Player Clustering** — Group similar players using unsupervised learning for intelligent comparison.
- 📈 **Predictive Insights** — Visualize tactical contributions, positional effectiveness, and performance trends.
- 📄 **PDF Reporting** — Download complete scouting reports with key performance indicators.

## 🧪 Technology Stack

| Component           | Technology                             |
|---------------------|----------------------------------------|
| Frontend            | HTML5, CSS3, JavaScript, Bootstrap     |
| AI & ML             | Generative AI, Clustering Algorithms   |
| Data Visualization  | Chart.js, D3.js                        |
| Data Source         | [FBRef](https://fbref.com/en/)         |
| Hosting             | GitHub Pages                           |

## 📚 Academic Reference

This project is inspired by the research:

**FPSRec: Football Players Scouting Recommendation System based on Generative AI**  
- *Authors:* Antonio Maria Rinaldi, Antonio Romano, Cristiano Russo, Cristian Tommasino  
- *Conference:* 2024 IEEE International Conference on Big Data (BigData)  
- *DOI:* [10.1109/BigData62323.2024.10825692](https://doi.org/10.1109/BigData62323.2024.10825692)

## 🧠 How It Works

1. Upload or retrieve player datasets.
2. AI processes player attributes and clusters similar profiles.
3. Generative AI creates textual scouting reports.
4. Users can explore, filter, and generate downloadable reports.

## 📂 Project Structure

```bash
├── index.html             # Landing page
├── js/                    # JavaScript for functionality
│   └── main.js
├── css/                   # Custom styles
│   └── style.css
├── data/                  # Player dataset
│   └── players.csv
├── assets/                # Logos and player images
├── reports/               # Downloadable reports
└── README.md
