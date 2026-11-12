// ============================================================
// STEP 1: Word lists we will look for in the resume
// ============================================================
var weakPhrases = [
    "responsible for", "duties included", "worked on", "helped with",
    "in charge of", "involved in", "participated in", "assisted with"
];

var cliches = [
    "hardworking", "team player", "detail-oriented", "go-getter",
    "results-driven", "self-starter", "synergy", "proactive",
    "excellent communication skills", "fast learner", "hard worker"
];

var strongVerbs = [
    "led", "built", "launched", "designed", "reduced", "increased",
    "created", "developed", "managed", "improved", "delivered",
    "automated", "implemented", "optimized", "organized", "wrote"
];

var sections = ["experience", "education", "skills", "projects", "summary"];

// ============================================================
// STEP 2: Small helper functions
// ============================================================

// Returns the phrases from "list" that appear inside "text"
function findPhrases(text, list) {
    var found = [];
    for (var i = 0; i < list.length; i++) {
        if (text.includes(list[i])) {
            found.push(list[i]);
        }
    }
    return found;
}

// Returns the verbs from "list" that appear as whole words in "words"
function findWords(words, list) {
    var found = [];
    for (var i = 0; i < list.length; i++) {
        if (words.includes(list[i])) {
            found.push(list[i]);
        }
    }
    return found;
}

// Turns a score out of 100 into a letter grade
function getGrade(score) {
    if (score >= 90) return "A";
    if (score >= 80) return "B";
    if (score >= 70) return "C";
    if (score >= 60) return "D";
    return "F";
}

// ============================================================
// STEP 3: The main function. Each block gives one score.
// Max points: 10 + 15 + 25 + 25 + 15 + 10 = 100
// ============================================================
function analyzeResume(text) {
    var lower = text.toLowerCase();
    var words = lower.split(/[^a-z]+/);            // list of plain words
    var wordCount = text.trim().split(/\s+/).length;
    var notes = [];                                // tips for the user

    // ---- 1. Contact info (max 10) ----
    var contactScore = 0;
    if (text.includes("@")) {
        contactScore += 5;
    } else {
        notes.push("No email address found.");
    }
    if (/\d{10}/.test(text.replace(/[\s\-().]/g, ""))) {
        contactScore += 3;
    } else {
        notes.push("No phone number found.");
    }
    if (lower.includes("linkedin") || lower.includes("github")) {
        contactScore += 2;
    } else {
        notes.push("Add a LinkedIn or GitHub link.");
    }

    // ---- 2. Sections (max 15, 3 points each) ----
    var foundSections = findPhrases(lower, sections);
    var sectionScore = foundSections.length * 3;
    if (foundSections.length < 4) {
        notes.push("Add clear headings like Education, Skills, Projects, Experience.");
    }

    // ---- 3. Action verbs (max 25) ----
    var foundVerbs = findWords(words, strongVerbs);
    var foundWeak = findPhrases(lower, weakPhrases);
    var verbScore = foundVerbs.length * 3 - foundWeak.length * 3;
    if (verbScore > 25) verbScore = 25;
    if (verbScore < 0) verbScore = 0;
    if (foundVerbs.length < 5) {
        notes.push("Start bullet points with action verbs like built, designed, created.");
    }
    if (foundWeak.length > 0) {
        notes.push("Weak phrases found: " + foundWeak.join(", ") + ". Say what you actually did.");
    }

    // ---- 4. Numbers and results (max 25) ----
    // Looks for things like 40%, $500, 10+
    var numbers = text.match(/\d+%|\$\d+|\d+\+/g) || [];
    var numberScore = numbers.length * 5;
    if (numberScore > 25) numberScore = 25;
    if (numbers.length < 3) {
        notes.push("Add numbers to show results (example: 'built 3 websites', 'improved speed by 30%').");
    }

    // ---- 5. Cliches (max 15) ----
    var foundCliches = findPhrases(lower, cliches);
    var clicheScore = 15 - foundCliches.length * 3;
    if (clicheScore < 0) clicheScore = 0;
    if (foundCliches.length > 0) {
        notes.push("Overused phrases found: " + foundCliches.join(", ") + ". Show skills with examples instead.");
    }

    // ---- 6. Length (max 10) ----
    var lengthScore = 3;
    if (wordCount >= 300 && wordCount <= 800) {
        lengthScore = 10;
    } else if (wordCount >= 150 && wordCount < 300) {
        lengthScore = 6;
    } else if (wordCount > 800 && wordCount <= 1000) {
        lengthScore = 6;
    }
    if (wordCount < 150) notes.push("Resume is very short (" + wordCount + " words).");
    if (wordCount > 1000) notes.push("Resume is too long (" + wordCount + " words). Try for one page.");

    // ---- Add everything up ----
    var total = contactScore + sectionScore + verbScore + numberScore + clicheScore + lengthScore;

    if (notes.length === 0) {
        notes.push("Looks good! No major problems found.");
    }

    return {
        total: total,
        rows: [
            ["Contact info", contactScore, 10],
            ["Sections", sectionScore, 15],
            ["Action verbs", verbScore, 25],
            ["Numbers / results", numberScore, 25],
            ["Cliches avoided", clicheScore, 15],
            ["Length", lengthScore, 10]
        ],
        notes: notes
    };
}

// ============================================================
// STEP 4: Show the result on the page when the button is clicked
// ============================================================
function showResult() {
    var text = document.getElementById("resumeInput").value;

    if (text.trim() === "") {
        document.getElementById("resumeAlert").showModal();
        document.getElementById("dismissAlert").focus();
        return;
    }
    var result = analyzeResume(text);

    // Overall score + grade
    document.getElementById("scoreTitle").textContent =
        "Score: " + result.total + " / 100  (Grade " + getGrade(result.total) + ")";

    // Table of category scores
    var tableHtml = "<tr><th>Category</th><th>Score</th></tr>";
    for (var i = 0; i < result.rows.length; i++) {
        var row = result.rows[i];
        tableHtml += "<tr><td>" + row[0] + "</td><td>" + row[1] + " / " + row[2] + "</td></tr>";
    }
    document.getElementById("scoreTable").innerHTML = tableHtml;

    // List of tips
    document.getElementById("notesTitle").textContent = "Tips to improve";
    var listHtml = "";
    for (var j = 0; j < result.notes.length; j++) {
        listHtml += "<li>" + result.notes[j] + "</li>";
    }
    document.getElementById("notesList").innerHTML = listHtml;
}

// ============================================================
// STEP 5: Connect the buttons to the functions
// ============================================================
document.querySelector('.hr-Line').classList.add('cs-line');

document.getElementById("dismissAlert").addEventListener("click", function () {
    document.getElementById("resumeAlert").close();
    document.getElementById("resumeInput").focus();
});

document.getElementById("analyzeBtn").addEventListener("click", ()=>{
    showResult();
    if (document.getElementById("resumeInput").value.trim() !== "") {
        document.querySelector('.hr-Line').classList.remove('cs-line');
        document.querySelector('.clr-btn2').classList.add('is-visible');
        document.querySelector('.cs-div').scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
});

document.getElementById("exampleBtn").addEventListener("click", function () {
    document.getElementById("resumeInput").value =
        "Jordan Ellis\n" +
        "jordan.ellis@email.com | (555) 214-8890 | linkedin.com/in/jordanellis\n\n" +
        "SUMMARY\n" +
        "Hardworking and detail-oriented fresher, a team player and fast learner.\n\n" +
        "EXPERIENCE\n" +
        "Marketing Intern, Fenwick Group\n" +
        "- Responsible for managing social media accounts\n" +
        "- Helped with email campaigns\n" +
        "- Participated in weekly team meetings\n\n" +
        "EDUCATION\n" +
        "B.A. Communications, State University, 2020\n\n" +
        "SKILLS\n" +
        "Microsoft Office, Social Media";
});
document.querySelector('.clr-btn').addEventListener("click" ,()=> { 
    document.getElementById("resumeInput").value = '';
})
document.querySelector('.clr-btn2').addEventListener("click", ()=>{
    document.getElementById("scoreTitle").innerHTML ='';
    document.getElementById("scoreTable").innerHTML ='';
    document.getElementById("notesTitle").innerHTML ='';
    document.getElementById("notesList").innerHTML ='';
    document.querySelector('.clr-btn2').classList.remove('is-visible');
})