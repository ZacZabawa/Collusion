import json
import os
import re
import datetime

def slugify(value):
    """
    Normalizes string, converts to lowercase, removes non-alpha characters,
    and converts spaces to hyphens.
    """
    # Remove exclamation marks and other special characters
    value = value.replace('!', '').replace('?', '').replace('.', '').replace(',', '')
    value = re.sub(r'[^\w\s-]', '', value).strip().lower()
    value = re.sub(r'[-\s]+', '-', value)
    return value

def process_media_files(note):
    """Process media files referenced in the note"""
    media_files = []
    media_pattern = r'!\[(.*?)\]\((.*?)\)'
    matches = re.findall(media_pattern, note['content'])
    
    for alt_text, file_path in matches:
        media_files.append({
            'path': file_path,
            'alt': alt_text,
            'type': os.path.splitext(file_path)[1].lower()
        })
    
    note['media_files'] = media_files
    return note

def process_note_fields(note):
    """Normalize field names and clean up values"""
    field_mappings = {
        'media__prefix': 'media_prefix',  # Fix double underscore
        'type': 'type',
        'graph': 'graph',
        'mainVid': 'mainVid'
    }
    
    # Create a new dictionary with processed fields
    processed_note = {}
    for key, value in note.items():
        new_key = field_mappings.get(key, key)
        # Skip duplicate keys
        if new_key not in processed_note:
            if value is None or value == "":
                processed_note[new_key] = ""
            else:
                processed_note[new_key] = value
            
    # Add default media prefix based on title if none exists
    if not processed_note.get('media_prefix'):
        processed_note['media_prefix'] = slugify(processed_note['title'])
    
    # Ensure all required fields exist
    required_fields = ['title', 'datetimeCreate', 'type', 'layout', 'media_prefix', 'content']
    for field in required_fields:
        if field not in processed_note:
            processed_note[field] = ""
    
    return processed_note

def write_markdown_file(file_path, note):
    """Write note data to markdown file with front matter"""
    front_matter = "---\n"
    for key, value in note.items():
        if key != 'content':
            if isinstance(value, list):
                # Remove quotes from list items
                cleaned_list = [str(item).strip("'\"") for item in value]
                front_matter += f"{key}: [{', '.join(cleaned_list)}]\n"
            else:
                front_matter += f"{key}: {value}\n"
    front_matter += "---\n"

    content = note.get('content', '').strip() + "\n"  # Ensure single newline at end
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(front_matter + content)

def main():
    # Read the flat JSON file containing notes from _data directory
    with open('_data/notes_flat.json', 'r') as f:
        notes = json.load(f)

    post_urls = {}  # Dictionary to store the URLs
    
    # Ensure _posts directory exists
    os.makedirs('_posts', exist_ok=True)

    # Generate markdown files and URLs
    for note in notes:
        try:
            note = process_media_files(note)
            processed_note = process_note_fields(note)
            title_slug = slugify(processed_note['title'])
            
            # Handle date
            date_string = processed_note.get('datetimeCreate', '')
            if date_string == '{{date}}' or not date_string:
                current_date = datetime.datetime.now()
                date_string = current_date.strftime('%Y-%m-%d')
                # Also update the note's datetimeCreate
                processed_note['datetimeCreate'] = current_date.strftime('%Y-%m-%dT%H:%M:%S.000Z')
            else:
                date_string = date_string.split('T')[0]
            
            # Split date into components
            year, month, day = date_string.split('-')
            
            # Generate file paths and URLs
            file_path = f"_posts/{date_string}-{title_slug}.md"
            post_url = f"/{year}/{month}/{day}/{title_slug}.html"
            post_urls[processed_note['title']] = post_url
            processed_note['url'] = post_url  # Add URL to the note object

            # Write the markdown file
            write_markdown_file(file_path, processed_note)
            print(f"Successfully processed: {processed_note['title']}")

        except Exception as e:
            print(f"Error processing note: {note.get('title', 'Unknown')}")
            print(f"Error details: {str(e)}")

    # Write post URLs to _data directory
    with open('_data/post_urls.json', 'w') as f:
        json.dump(post_urls, f, indent=4)

    # Create hierarchical structure with URLs
    create_hierarchical_structure(notes, post_urls)

def create_hierarchical_structure(notes, post_urls):
    # Your existing hierarchy creation logic here
    # Make sure to include the URL from post_urls when creating project nodes
    hierarchical_data = []
    # ... rest of hierarchy creation ...
    
    # Write the hierarchical data with URLs
    with open('_data/notes_hierarchical_with_urls.json', 'w') as f:
        json.dump(hierarchical_data, f, indent=4)

if __name__ == "__main__":
    main()