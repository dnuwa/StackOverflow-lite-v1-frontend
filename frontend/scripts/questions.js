document.getElementById("addquestion").addEventListener("submit", postQuestion);

function postQuestion(e) {
    e.preventDefault();
    let Question = document.getElementById('question').value;

    console.log(Question);
    fetch('http://127.0.0.1:5000/api/v1/questions', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem("access_token"),
                'Accept': 'application/json, text/plain, */*',
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                question: Question
            })
        })
        .then((res) => res.json())
        .then((data) => {
            console.log(data)
            if ("Token" in data) {
                localStorage.setItem("access_token", data.Token);
                alert(data.msg);
                window.location.href = 'home.html'
            } else if (data.msg === "Token has expired") {
                alert(data.msg)
                window.location.href = 'login.html'
            } else if (data.msg === "Question already exists") {
                alert(data.msg)
                    // console.log(data.msg)
                window.location.href = 'home.html'
            } else if (data.msg === "Question has successfully added") {
                alert("Question has been successfully added")
                window.location.href = 'home.html'
            }

        })
}

document.getElementById("allQuestions").addEventListener("load", getAllquestions());

function getAllquestions() {
    fetch('http://127.0.0.1:5000/api/v1/questions', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem("access_token"),
                'Accept': 'application/json, text/plain, */*',
                'Content-type': 'application/json'
            }
        })
        .then((res) => res.json())
        .then((data) => {
            // console.log(data)
            let output = '<h2 class="qn-heading">All Questions..</h2>'
            data.forEach(function(post) {

                output += `
                            <ul class="quetions">
                            <li onclick="viewQuestion(${post.qn_id})">${post.question}</li>                            
                            </ul>
                            <hr>
                        `;


            });

            document.getElementById('allQuestions').innerHTML = output;
            document.getElementById('profile-heading').innerHTML = localStorage.getItem("name");

        })

    .catch((err) => console.log(err))
}

// returns a question with all its answers
function viewQuestion(qn_id) {

    // console.log(qn_id)

    fetch('http://127.0.0.1:5000/api/v1/questions/' + qn_id, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem("access_token"),
                'Accept': 'application/json, text/plain, */*',
                'Content-type': 'application/json'
            }
        })
        .then((res) => res.json())
        .then((data) => {
            // console.log(data)
            let output = '<h4>answers..</h4>'
            ans = data[1]
                // console.log(ans)
            ans.forEach(function(qnanswer) {
                // console.log(qnanswer.answer, qnanswer.prefered);
                output += `
                <ul>
                <li><a href="editanAnswer.html?question_id=${qn_id}&answer_id=${qnanswer.ans_id}">${qnanswer.answer}(${qnanswer.prefered})</a></li>
                </ul>
                `
            })

            //store the qn_id as the question and its answers loads
            localStorage.setItem("qn_id", qn_id);
            // console.log(qn_id);
            console.log(ans);
            document.getElementById('asked-qn').innerHTML = `<div class="asked-qn-heading">${data[0]}</div>`
            document.getElementById('answers-sector').innerHTML = output;
            document.getElementById('profile-heading').innerHTML = localStorage.getItem("name");

        })
        .catch((err) => console.log(err))
}