document.getElementById("addquestion").addEventListener("submit", postQuestion);

function postQuestion(e) {
    e.preventDefault();
    let Question = document.getElementById('question').value;

    console.log(Question);
    fetch('https://stackoverflow-lite-v1-frontend.herokuapp.com/api/v1/questions', {
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

                swal({
                    text: data.msg
                }).then(function() {
                    window.location.href = 'home.html'
                })
            } else if (data.msg === "Token has expired") {
                swal({
                    text: data.msg
                }).then(function() {
                    window.location.href = 'login.html'
                })
            } else if (data.msg === "Question already exists") {
                swal({
                    text: data.msg
                }).then(function() {
                    window.location.href = 'home.html'
                })
            } else if (data.msg === "Question has successfully added") {
                swal({
                    type: 'success',
                    text: "Question has been successfully added"
                }).then(function() {
                    window.location.href = 'home.html'
                })
            }

        })
}

document.getElementById("allQuestions").addEventListener("load", getAllquestions());

function getAllquestions() {
    fetch('https://stackoverflow-lite-v1-frontend.herokuapp.com/api/v1/questions', {
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

    fetch('https://stackoverflow-lite-v1-frontend.herokuapp.com/api/v1/questions/' + qn_id, {
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
                <li><a href="update_answer.html?question_id=${qn_id}&answer_id=${qnanswer.ans_id}">${qnanswer.answer}(${qnanswer.prefered})</a></li>
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

//posting an answer to a question
document.getElementById("postanswer").addEventListener("submit", postAnswer);

function postAnswer(e) {
    e.preventDefault();
    let Answer = document.getElementById('answer').value;
    let question_id = localStorage.getItem("qn_id");

    console.log(Answer);
    fetch('https://stackoverflow-lite-v1-frontend.herokuapp.com/api/v1/questions/' + question_id + '/answers', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem("access_token"),
                'Accept': 'application/json, text/plain, */*',
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                answer: Answer
            })
        })
        .then((result) => result.json())
        .then((data) => {
            // console.log(data)
            if (data.msg === "An answer has been successfully added") {
                swal({
                    type: 'success',
                    text: data.msg
                }).then(function() {
                    window.location.href = 'home.html'
                })
            } else if (data.msg === "Token has expired") {
                swal({
                    text: 'Your session is expired. Please log in agin to continue :)'
                }).then(function() {
                    window.location.href = 'login.html'
                })
            } else if (data.msg === "This answer already exists") {
                swal({
                    text: data.msg
                }).then(function() {
                    window.location.href = 'home.html'
                })
            } else {
                swal({
                    type: 'error',
                    title: 'Oops...',
                    text: data.error
                })
            }

        })
}

//delete a question
// document.getElementById("delete").addEventListener("click", deleteqn);

function deleteqn() {
    let qntoDelete = localStorage.getItem("qn_id");
    console.log(qntoDelete);
    fetch('https://stackoverflow-lite-v1-frontend.herokuapp.com/api/v1/questions/' + qntoDelete, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem("access_token"),
                'Accept': 'application/json, text/plain, */*',
                'Content-type': 'application/json'
            }
        })
        .then((res) => res.json())
        .then((resdata) => {


            if (resdata.msg === "Question successfuly deleted") {
                console.log(resdata);
                swal({
                    text: resdata.msg
                }).then(function() {
                    window.location.href = 'home.html'
                })
            } else if (resdata.error === "Un-Authorised to DELETE this QN") {
                console.log(resdata);
                swal({
                    type: 'error',
                    title: 'Oops...',
                    text: resdata.error

                }).then(function() {
                    window.location.href = 'home.html'
                })
            }

        })
}

//logging out a  user
// document.getElementById("logout").addEventListener("click", Logout);

function Logout() {
    localStorage.removeItem('qn_id');
    localStorage.removeItem('name');
    localStorage.removeItem("access_token");
    localStorage.removeItem('ans_id');
    window.location.href = 'index.php';
}