addEventListener("load", getAllUsersquestions);

function getAllUsersquestions() {
    fetch('https://stackoverflow-lite-v1-frontend.herokuapp.com/api/v1/userquestions', {
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
            let questionsoutput = '<h2 class="qn-heading">My Questions..</h2>'
            data.forEach(function(post) {

                questionsoutput += `
                            <ul class="quetions">
                            <li onclick="viewQuestion(${post.qn_id})">${post.question}</li>                            
                            </ul>
                            <hr>
                        `;


            });

            document.getElementById('Questions').innerHTML = questionsoutput;
            document.getElementById('profile-heading').innerHTML = localStorage.getItem("name");

        })

    .catch((err) => console.log(err))
}