from flask import Flask, request
from models.dbmodels import DatabaseAccess
from flask_restful import Resource, Api
from werkzeug.security import generate_password_hash, check_password_hash
import re
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import flask_restful
from flask_cors import CORS

app = Flask(__name__)
api = flask_restful.Api(app, prefix="/api/v1", catch_all_404s=True)

CORS(app)


@app.before_first_request
def create_tables():
    data = DatabaseAccess()
    data.create_table_answer()
    data.create_table_questions()
    data.create_table_subscribers()


class Users(Resource):

    def post(self):
        new_user = DatabaseAccess()
        # new_user.create_table_subscribers()

        data = request.get_json()
        try:
            display_name = data['display_name'].strip()
            email = data['email'].strip()
            secure = data['password'].strip()

            if len(secure) < 8:
                return {'msg': 'Make sure your password is at lest 8 characters'}, 400

            if len(display_name) < 6:
                return {'msg': 'Make sure your display_name is at lest 6 characters'}, 400

            hashed_password = generate_password_hash(
                secure, method='sha256')

            if display_name == "" or hashed_password == "":
                return {'error': 'ensure all feilds are field correctlty'}, 400

            if not re.match("^[a-zA-Z0-9_ ]*$", display_name):
                return {'error': 'Your display_name can only contain numbers and letters'}, 400

            if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
                return {'error': 'Invalid email address'}, 400

            check_name = new_user.no_name_duplicates(display_name)
            check_email = new_user.no_email_duplicates(email)
            for user_name in check_name:
                if user_name['display_name'] == display_name:
                    return {'msg': 'This display_name is taken, choose another'}, 401
            for user_email in check_email:
                if user_email['email'] == email:
                    return {'msg': 'An account with this email exists'}, 401

            new_user.add_new_subscriber(display_name, email, hashed_password)

            return {'msg': 'You  have successfully signed as {}'.format(display_name)}, 201

        except KeyError as e:
            return {'error': str(e)+",missed out some info, check the keys too"}, 400

    def get(self):
        all_subscribers = DatabaseAccess()
        subscribers = all_subscribers.query_all_subscribers()
        return {'subscribers': subscribers}, 200


class AuthLogin(Resource):
    def post(self):
        try:
            data = request.get_json()
            display_name = data['display_name'].strip()
            password = data['password'].strip()

            userobj = DatabaseAccess()
            current_user = userobj.no_name_duplicates(display_name)

            if not current_user:
                return {'error': 'User {} doesn\'t exist'.format(display_name)}, 401

            for user in current_user:
                if user['display_name'] == display_name and check_password_hash(user['password'], password):
                    access_token = create_access_token(
                        identity=user['user_id'])
                    return {
                        'msg': 'Logged in as {}'.format(user['display_name']),
                        'Token': access_token
                    }, 200

                else:
                    return {'error': 'You have entered a wrong password'}, 400

        except Exception as err:
            return {'error': str(err)+" field missing!"}, 401


class Questions(Resource):

    @jwt_required
    def post(self):
        new_qn = DatabaseAccess()
        # new_qn.create_table_questions()
        qn_info = request.get_json()

        try:
            question = qn_info['question'].strip()
            current_user_id = get_jwt_identity()
            check = new_qn.no_qn_duplicates(question)

            if question == "":
                return {'error': 'Please add a question'}, 400

            for quest in check:
                if quest['question'] == question:
                    return {'msg': 'Question already exists'}, 400

            new_qn.post_a_question(current_user_id, question)
            return {'msg': 'Question has successfully added'}, 201

        except Exception as err:
            return {'error': str(err) + "field missing!"}, 401

    @jwt_required
    def get(self):
        fetch_all = DatabaseAccess()
        all_questions = fetch_all.retrieve_all()
        return all_questions, 200


class QuestionByID(Resource):

    @jwt_required
    def get(self, questionId):
        question = None

        qn_list = []
        try:
            fetch_one_qn = DatabaseAccess()
            ID = int(questionId)
            question_list = fetch_one_qn.get_qn_by_id(ID)
            answers_list = fetch_one_qn.get_answers_to_a_qn(questionId)
            if not question_list:
                return {'msg': 'No question with ID {}'.format(ID)}, 401

            for qn in question_list:
                question = qn['question']
                # qn_id = qn['qn_id']

            qn_list = [question, answers_list]
            return qn_list, 200
            # return answers_list, 200
        except ValueError as err:
            return {'error': str(err)+'should be an integer'}, 406

    @jwt_required
    def delete(self, questionId):
        try:
            user_id = get_jwt_identity()

            qn = DatabaseAccess()
            result = qn.get_qn_by_id(questionId)
            for item in result:
                if item['user_id'] == user_id:

                    qn.delete_question(questionId)
                    qn.delete_all_answers_to_a_deleted_question(questionId)

                    return {'msg': 'Question successfuly deleted'}, 200  # 204

                else:
                    return {'error': 'Un-Authorised to DELETE this QN'}, 403

            return {'error': 'Attempt to delete non existing data'}, 200  # 204

        except Exception as err:
            return {'error': str(err) + "THE questionID SHOULD BE AN INTEGER!"}, 406


class Answers(Resource):

    @jwt_required
    def post(self, questionId):
        data = request.get_json()
        user_id = get_jwt_identity()
        try:
            answer = data['answer']
            new_answer = DatabaseAccess()
            qnId = int(questionId)
            db_check = new_answer.get_qn_by_id(qnId)
            if not db_check:
                return {'error': 'Question does not exist'}

            new_check = new_answer.no_duplicate_answers(answer)
            for ans_list in new_check:
                if ans_list['answer'] == answer:
                    return {'msg': 'This answer already exists'}, 401

            new_answer.create_table_answer()
            new_answer.post_answer(qnId, user_id, answer)
            return {'msg': 'An answer has been successfully added'}, 201

        except Exception as err:
            return {'error': str(err) + "THE questionID SHOULD BE AN INTEGER!"}, 406


class FetchAllAnswers(Resource):

    def get(self):
        all_answers = DatabaseAccess()
        select_all_answers = all_answers.get_all_answers()
        return {'All-Answers': select_all_answers}


class MarkAnswerPreferred(Resource):

    @jwt_required
    def put(self, questionId, answerId):
        current_user_identity = get_jwt_identity()

        query = DatabaseAccess()
        query_questions_table = query.get_qn_by_id(questionId)
        for user in query_questions_table:
            if int(user['user_id']) == current_user_identity:
                answer_to_mark = DatabaseAccess()
                answer_to_mark.mark_answer(questionId, answerId)
                return {'msg': 'Answer has been marked as prefered'}, 201
            else:
                return {'msg': 'You do not own this qn'}, 403


class EditAnswer(Resource):

    @jwt_required
    def put(self, questionId, answerId):
        try:
            current_user_identity = get_jwt_identity()

            query = DatabaseAccess()
            result_on_query = query.query_answers_table(questionId, answerId)

            if not result_on_query:
                return {'msg': 'No such answer in database'}, 401

            # updating an answer
            if int(result_on_query['user_id']) == current_user_identity:
                new_data = request.get_json()
                ans_changes = new_data['answer'].strip()
                qnobj = DatabaseAccess()
                qnobj.edit_answer(questionId, answerId, ans_changes)
                return {'msg': 'Changes have been saved successfully'}, 201

            else:
                return {'msg': 'you are not permited to edit this'}, 403

        except Exception as err:
            return {'error': str(err) + "THE questionID and answerId SHOULD BE INTEGERS!"}, 406
