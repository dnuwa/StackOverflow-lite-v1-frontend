import psycopg2
from psycopg2.extras import RealDictCursor
import os
from flask import Flask


class DatabaseAccess:
    def __init__(self):
        if os.getenv('APP_SETTINGS') == "testing":
            self.dbname = "test_db"

        else:
            self.dbname = "ddleuprh9o7ok2"

        try:
            self.conn = psycopg2.connect(dbname="{}".format(
                self.dbname), user=os.getenv('User'), password=os.getenv('Password'), host=os.getenv('Host'))
            self.conn.autocommit = True

            self.cursor = self.conn.cursor(cursor_factory=RealDictCursor)
            print("database Connected")

        except psycopg2.Error:
            print("can not establish a database connection")

    def create_table_subscribers(self):
        sql_query = "CREATE TABLE IF NOT EXISTS subscribers(user_id serial PRIMARY KEY, display_name varchar(100) NOT NULL, email varchar(100) NOT NULL, password varchar(100) NOT NULL)"
        self.cursor.execute(sql_query)

    def add_new_subscriber(self, display_name, email, password):
        query = "INSERT INTO subscribers (display_name, email, password) VALUES (%s, %s, %s)"
        self.cursor.execute(query, (display_name, email, password))

    def query_all_subscribers(self):
        query = "SELECT * FROM subscribers"
        self.cursor.execute(query)
        rows = self.cursor.fetchall()
        return rows

    def no_name_duplicates(self, display_name):
        query = "SELECT * FROM subscribers WHERE display_name = %s"
        self.cursor.execute(query, (display_name, ))
        rows = self.cursor.fetchall()
        return rows

    def no_email_duplicates(self, email):
        query = "SELECT * FROM subscribers WHERE email = %s"
        self.cursor.execute(query, (email, ))
        rows = self.cursor.fetchall()
        return rows

    def create_table_questions(self):
        sql_query = "CREATE TABLE IF NOT EXISTS questions(qn_id serial PRIMARY KEY, user_id INTEGER NOT NULL, question varchar(1000) NOT NULL)"
        self.cursor.execute(sql_query)

    def post_a_question(self, user_id, question):
        sql_query = "INSERT INTO questions (user_id, question) VALUES (%s, %s)"
        self.cursor.execute(sql_query, (user_id, question,))

    def retrieve_all(self):
        dbquery = "SELECT qn_id, question FROM questions"
        self.cursor.execute(dbquery)
        data = self.cursor.fetchall()
        return data

    def no_qn_duplicates(self, qn):
        query = "SELECT * FROM questions WHERE question = %s"
        self.cursor.execute(query, (qn, ))
        result = self.cursor.fetchall()
        return result

    def get_qn_by_id(self, qn_id):
        qnquery = "SELECT * FROM questions WHERE qn_id = %s"
        self.cursor.execute(qnquery, (qn_id, ))
        data = self.cursor.fetchall()
        return data

    def delete_question(self, qn_id):
        deletion_query = "DELETE FROM questions WHERE qn_id = %s"
        self.cursor.execute(deletion_query, (qn_id, ))

    def create_table_answer(self):
        sql_query = "CREATE TABLE IF NOT EXISTS answers(ans_id serial PRIMARY KEY, qn_id INTEGER NOT NULL, user_id INTEGER NOT NULL, answer varchar(200) NOT NULL, prefered BOOLEAN NOT NULL DEFAULT FALSE)"
        self.cursor.execute(sql_query)

    def post_answer(self, qn_id, user_id, ans):
        ans_query = "INSERT INTO answers (qn_id, user_id, answer) VALUES (%s, %s, %s)"
        self.cursor.execute(ans_query, (qn_id, user_id, ans))

    def get_all_answers(self):
        get_all_query = "SELECT * FROM answers"
        self.cursor.execute(get_all_query)
        result = self.cursor.fetchall()
        return result

    def no_duplicate_answers(self, user_answer):
        query = "SELECT answer FROM answers WHERE answer = %s"
        self.cursor.execute(query, (user_answer,))
        data = self.cursor.fetchall()
        print(data)
        return data

    def get_answers_to_a_qn(self, qn_id):
        query = "SELECT ans_id, answer, prefered FROM answers WHERE qn_id = %s"
        self.cursor.execute(query, (qn_id, ))
        data = self.cursor.fetchall()
        return data

    def delete_all_answers_to_a_deleted_question(self, qn_id):
        deletion_query = "DELETE FROM answers WHERE qn_id = %s"
        self.cursor.execute(deletion_query, (qn_id, ))

    def query_answers_table(self, qn_id, ans_id):
        query_db = "SELECT * FROM answers WHERE ans_id = %s AND qn_id = %s"
        vars = ans_id, qn_id
        self.cursor.execute(query_db, vars)
        result = self.cursor.fetchone()
        return result

    def edit_answer(self, qn_id, ans_id, ans_changes):
        query = "UPDATE answers SET answer = %s WHERE qn_id = %s AND ans_id = %s"
        vars = ans_changes, qn_id, ans_id
        self.cursor.execute(query, vars)

    def mark_answer(self, qn_id, ans_id):
        mark_query = "UPDATE answers SET prefered=TRUE WHERE  qn_id = %s and ans_id = %s"
        vars = qn_id, ans_id
        self.cursor.execute(mark_query, vars)

    # extras

    def qns_to_user(self, user_id):
        query = "SELECT * FROM questions WHERE user_id = %s"
        self.cursor.execute(query, (user_id,)) 
        rows = self.cursor.fetchall()
        return rows

    def ans_to_user(self, user_id):
        query = "SELECT * FROM answers WHERE user_id = %s"
        self.cursor.execute(query, (user_id,)) 
        rows = self.cursor.fetchall()
        return rows
