from flask import Blueprint, request, jsonify
from supabase import create_client, Client
from datetime import datetime, timezone
import random
import os

archetype_prompts = Blueprint('archetype_prompts', __name__)

supabase_url = os.getenv('SUPABASE_URL', 'https://hiwmpmvqcxzshdmhhlsb.supabase.co')
supabase_key = os.getenv('SUPABASE_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhpd21wbXZxY3h6c2hkbWhobHNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5NDAzMjcsImV4cCI6MjA3NDUxNjMyN30.RXa8Bx3Pwy9Du2j-XD8WaGDjuCVe9H-PLTgMLJa11ZE')
supabase: Client = create_client(supabase_url, supabase_key)

archetypes = ['Mystic', 'Warrior', 'Sage', 'Lover', 'Explorer', 'Creator']

numerology_meanings = {
    1: 'leadership spark', 2: 'harmonious balance', 3: 'creative joy', 4: 'stable foundation',
    5: 'adventurous freedom', 6: 'nurturing love', 7: 'mystic wisdom', 8: 'abundant power',
    9: 'universal compassion', 11: 'enlightened vision', 22: 'master legacy'
}
prompt_templates = {
    'Mystic': [
        'What cosmic secret does your {zodiac} sigil whisper under the {planet} hour\'s ethereal glow?',
        'As a {zodiac} Mystic with Life Path {life_path} ({life_path_meaning}), what vision does {tarot} unveil in the {planet} hour\'s celestial veil?',
        'How does the {planet} hour guide your {zodiac} Mystic’s Life Path {life_path} ({life_path_meaning}) to unravel {tarot}’s hidden truth?',
        'What ancient wisdom does your {zodiac} Mystic, with Destiny {destiny} ({destiny_meaning}), find in {tarot} under {planet}’s mystic tide?',
        'As a {zodiac} Mystic with Life Path {life_path} ({life_path_meaning}), how does {planet}’s energy shape your {tarot}-inspired dreams?',
        'What celestial spark does {tarot} ignite in your {zodiac} Mystic’s Destiny {destiny} ({destiny_meaning}) during the {planet} hour?',
        'How does your {zodiac} Mystic commune with {planet}’s cosmic pulse through {tarot}’s lens?'
    ],
    'Warrior': [
        'How does your {zodiac} Warrior wield {tarot}’s power in the {planet} hour\'s fiery charge?',
        'As a {zodiac} Warrior, what battle do you face under {planet}’s bold influence with {tarot}’s strength?',
        'What conquest does your {zodiac} Warrior pursue in the {planet} hour, guided by {tarot}’s triumph?',
        'How does {planet}’s energy fuel your {zodiac} Warrior’s resolve to master {tarot}’s challenge?',
        'As a {zodiac} Warrior, what bold path does {tarot} carve under {planet}’s radiant clash?',
        'What foe does your {zodiac} Warrior confront with {tarot}’s might in the {planet} hour?',
        'How does your {zodiac} Warrior’s {tarot}-inspired courage shine in {planet}’s fierce light?'
    ],
    'Sage': [
        'What wisdom does your {zodiac} Sage draw from {tarot} in the {planet} hour\'s tranquil glow?',
        'As a {zodiac} Sage, how do you interpret {planet}’s cosmic message through {tarot}’s insight?',
        'What ancient truth does your {zodiac} Sage uncover in {tarot} under {planet}’s guiding star?',
        'How does the {planet} hour illuminate your {zodiac} Sage’s path to {tarot}’s eternal wisdom?',
        'As a {zodiac} Sage, what lesson does {tarot} teach you in the {planet} hour’s stillness?',
        'What cosmic balance does your {zodiac} Sage find in {tarot} during {planet}’s serene reign?',
        'How does your {zodiac} Sage weave {tarot}’s knowledge into {planet}’s celestial harmony?'
    ],
    'Lover': [
        'How does your {zodiac} Lover connect through {tarot} under the {planet} hour\'s tender embrace?',
        'As a {zodiac} Lover, what harmony do you seek in {tarot}’s light during the {planet} hour?',
        'What bond does your {zodiac} Lover forge with {tarot} in the {planet} hour\'s radiant warmth?',
        'How does {planet}’s gentle pulse guide your {zodiac} Lover to {tarot}’s heart of unity?',
        'As a {zodiac} Lover, what passion does {tarot} awaken under {planet}’s loving gaze?',
        'What connection does your {zodiac} Lover nurture with {tarot} in the {planet} hour’s glow?',
        'How does your {zodiac} Lover’s {tarot}-inspired heart dance in {planet}’s cosmic rhythm?'
    ],
    'Explorer': [
        'Where does your {zodiac} Explorer venture with {tarot} in the {planet} hour\'s boundless realm?',
        'As a {zodiac} Explorer, what frontier does {planet} reveal through {tarot}’s cosmic map?',
        'What uncharted path does your {zodiac} Explorer tread with {tarot} under {planet}’s starry guide?',
        'How does {planet}’s energy propel your {zodiac} Explorer toward {tarot}’s distant horizon?',
        'As a {zodiac} Explorer, what discovery does {tarot} spark in the {planet} hour’s vast expanse?',
        'What cosmic trail does your {zodiac} Explorer blaze with {tarot} in {planet}’s radiant dawn?',
        'How does your {zodiac} Explorer navigate {tarot}’s mysteries under {planet}’s celestial call?'
    ],
    'Creator': [
        'What does your {zodiac} Creator craft with {tarot} under the {planet} hour\'s radiant spark?',
        'As a {zodiac} Creator, how does {planet} inspire your {tarot}-fueled masterpiece?',
        'What cosmic art does your {zodiac} Creator weave with {tarot} in the {planet} hour’s glow?',
        'How does {planet}’s energy shape your {zodiac} Creator’s vision for {tarot}’s eternal form?',
        'As a {zodiac} Creator, what spark does {tarot} ignite under {planet}’s vibrant muse?',
        'What masterpiece does your {zodiac} Creator forge with {tarot} in {planet}’s cosmic blaze?',
        'How does your {zodiac} Creator’s {tarot}-inspired art flourish in {planet}’s radiant tide?'
    ]
}

def calculate_life_path(birthdate: str) -> int:
    """Calculate Life Path Number from birthdate (YYYY-MM-DD)."""
    digits = [int(d) for d in birthdate.replace('-', '') if d.isdigit()]
    total = sum(digits)
    while total > 9 and total not in [11, 22]:
        total = sum(int(d) for d in str(total))
    return total

def calculate_destiny(full_name: str) -> int:
    """Calculate Destiny Number from full name."""
    letter_values = {l: i + 1 for i, l in enumerate('abcdefghijklmnopqrstuvwxyz')}
    total = sum(letter_values.get(c.lower(), 0) for c in full_name if c.isalpha())
    while total > 9 and total not in [11, 22]:
        total = sum(int(d) for d in str(total))
    return total

@archetype_prompts.route('/api/v1/prompt/generate', methods=['POST'])
def generate_prompt():
    data = request.get_json()
    user_id = data.get('user_id')
    zodiac_sign = data.get('zodiac_sign', 'Libra')
    tarot_card = data.get('tarot_card', 'The Lovers')
    planetary_hour = data.get('planetary_data', {}).get('hour_planet', 'Venus')
    archetype = data.get('archetype', random.choice(archetypes))
    birthdate = data.get('birthdate', '1990-05-15')  # Default for testing
    full_name = data.get('full_name', 'Jane Doe')    # Default for testing

    life_path = calculate_life_path(birthdate)
    destiny = calculate_destiny(full_name)
    prompt = random.choice(prompt_templates[archetype]).format(
        zodiac=zodiac_sign,
        tarot=tarot_card,
        planet=planetary_hour,
        life_path=life_path,
        life_path_meaning=numerology_meanings[life_path],
        destiny=destiny,
        destiny_meaning=numerology_meanings[destiny]
    )

    supabase.table('prompts').insert({
        'user_id': user_id,
        'archetype': archetype,
        'prompt': prompt,
        'zodiac_sign': zodiac_sign,
        'tarot_card': tarot_card,
        'planetary_hour': planetary_hour,
        'life_path': life_path,
        'destiny': destiny,
        'created_at': datetime.now(timezone.utc).isoformat()
    }).execute()

    return jsonify({
        'prompt': prompt,
        'archetype': archetype,
        'life_path': life_path,
        'destiny': destiny,
        'status': 'generated'
    })

@archetype_prompts.route('/api/v1/prompt/respond', methods=['POST'])
def respond_prompt():
    data = request.get_json()
    user_id = data['user_id']
    prompt_id = data['prompt_id']
    response = data['response']

    supabase.table('prompt_responses').insert({
        'user_id': user_id,
        'prompt_id': prompt_id,
        'response': response,
        'created_at': datetime.now(timezone.utc).isoformat()
    }).execute()

    supabase.table('user_actions').insert({
        'user_id': user_id,
        'action_type': 'prompt_response',
        'timestamp': datetime.now(timezone.utc).isoformat()
    }).execute()

    return jsonify({'status': 'response_saved'})

@archetype_prompts.route('/api/v1/prompts/<int:user_id>', methods=['GET'])
def get_user_prompts(user_id):
    """Get user's recent prompts for display in feed"""
    page = int(request.args.get('page', 1))
    per_page = 10

    result = supabase.table('prompts').select('*').eq('user_id', user_id).order('created_at.desc').range((page-1)*per_page, page*per_page-1).execute()

    prompts = []
    for prompt in result.data or []:
        # Get response count
        response_count = supabase.table('prompt_responses').select('count', count='exact').eq('prompt_id', prompt['id']).execute()
        count = response_count.count or 0

        prompts.append({
            'id': prompt['id'],
            'prompt': prompt['prompt'],
            'archetype': prompt['archetype'],
            'zodiac_sign': prompt['zodiac_sign'],
            'tarot_card': prompt['tarot_card'],
            'planetary_hour': prompt['planetary_hour'],
            'created_at': prompt['created_at'],
            'response_count': count
        })

    return jsonify({'prompts': prompts})

@archetype_prompts.route('/api/v1/prompt/<int:prompt_id>/responses', methods=['GET'])
def get_prompt_responses(prompt_id):
    """Get responses to a specific prompt"""
    result = supabase.table('prompt_responses').select('*').eq('prompt_id', prompt_id).order('created_at.desc').execute()

    responses = []
    for response in result.data or []:
        # Get username
        user_result = supabase.table('user').select('username, zodiac_sign').eq('id', response['user_id']).execute()
        username = user_result.data[0]['username'] if user_result.data else 'Unknown'
        zodiac_sign = user_result.data[0]['zodiac_sign'] if user_result.data else 'Unknown'

        responses.append({
            'id': response['id'],
            'response': response['response'],
            'author': username,
            'zodiac_sign': zodiac_sign,
            'created_at': response['created_at']
        })

    return jsonify({'responses': responses})
