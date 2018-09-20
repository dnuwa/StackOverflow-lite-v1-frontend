document.getElementById("editanswer").addEventListener("load", loadInputfield());

var url_string = window.location.href;
var url = new URL(url_string);
var qn_id = url.searchParams.get("question_id");
var ans_id = url.searchParams.get("answer_id");

localStorage.setItem("ans_id", ans_id);

function loadInputfield() {
    //reload the window once after it loads the first time
    window.onload = function() {
        if (!window.location.hash) {
            window.location = window.location + '#loaded';
            window.location.reload();
        }
    }

    let qn_id = localStorage.getItem("qn_id");
    let ans_id = localStorage.getItem("ans_id");
    console.log(qn_id);
    console.log(ans_id);
    fetch('http://127.0.0.1:5000/api/v1/questions/' + qn_id + '/answers/' + ans_id + '/edit', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem("access_token"),
                'Accept': 'application/json, text/plain, */*',
                'Content-type': 'application/json'
            }
        })
        .then((res) => res.json())
        .then((data) => {
            // setTimeout(function() { document.location.reload(true); }, 1000);
            console.log(data.answer);
            document.getElementById('showanswer').innerHTML = data.answer;
            document.getElementById('answertxt').value = data.answer;

        })

    .catch((err) => console.log(err))
}


//edit an answer
document.getElementById("editanswer").addEventListener("submit", editAnswer);

function editAnswer(e) {
    e.preventDefault();
    let edited_naswer = document.getElementById('answertxt').value;

    console.log(edited_naswer);
    fetch('http://127.0.0.1:5000/api/v1/questions/' + qn_id + '/answers/' + ans_id + '/edit', {
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem("access_token"),
                'Accept': 'application/json, text/plain, */*',
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                answer: edited_naswer
            })
        })
        .then((res) => res.json())
        .then((data) => {
            console.log(data)

            if (data.msg === "you are not permited to edit this") {
                alert(data.msg);
                window.location.href = 'home.html'
            } else if (data.msg === "Token has expired") {
                alert(data.msg)
                window.location.href = 'login.html'
            } else if (data.msg === "Changes have been saved successfully") {
                alert(data.msg)
                window.location.href = 'home.html'
            }
        })
}

//accept the answer as prefered
function Accept() {
    let qn_id = localStorage.getItem("qn_id");
    let ans_id = localStorage.getItem("ans_id");
    console.log(qn_id);
    console.log(ans_id);
    fetch('http://127.0.0.1:5000/api/v1/questions/' + qn_id + '/answers/' + ans_id + '/preferred', {
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem("access_token"),
                'Accept': 'application/json, text/plain, */*',
                'Content-type': 'application/json'
            }
        })
        .then((res) => res.json())
        .then((data) => {
            console.log(data)

            if (data.msg === "Answer has been marked as prefered") {
                alert(data.msg);
                window.location.href = 'home.html'
            } else if (data.msg === "Token has expired") {
                alert(data.msg)
                window.location.href = 'login.html'
            } else if (data.msg === "You do not own this qn") {
                alert(data.msg)
                window.location.href = 'home.html'
            }
        })
}