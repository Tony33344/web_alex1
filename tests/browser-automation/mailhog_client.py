"""
Mailhog API Client for Email Verification
Used to check if emails were sent during tests
"""
import requests
import time
from typing import Optional, Dict, List

class MailhogClient:
    """Client for interacting with Mailhog API"""
    
    def __init__(self, host: str = "localhost", port: int = 8025):
        self.base_url = f"http://{host}:{port}/api/v2"
    
    def get_messages(self, limit: int = 50) -> List[Dict]:
        """Get all messages from Mailhog"""
        response = requests.get(f"{self.base_url}/messages", params={"limit": limit})
        response.raise_for_status()
        return response.json().get("items", [])
    
    def search_messages(self, query: str, limit: int = 50) -> List[Dict]:
        """Search for messages matching a query"""
        try:
            response = requests.get(
                f"{self.base_url}/search",
                params={"query": query, "limit": limit}
            )
            response.raise_for_status()
            return response.json().get("items", [])
        except Exception as e:
            print(f"Error searching messages: {e}")
            # Fallback: get all messages and filter manually
            all_messages = self.get_messages(limit)
            return all_messages
    
    def get_message_by_id(self, message_id: str) -> Dict:
        """Get a specific message by ID"""
        response = requests.get(f"{self.base_url}/messages/{message_id}")
        response.raise_for_status()
        return response.json()
    
    def delete_all_messages(self) -> None:
        """Delete all messages from Mailhog"""
        requests.delete(f"{self.base_url}/messages")
    
    def wait_for_email(
        self,
        subject: str,
        recipient: Optional[str] = None,
        timeout: int = 30,
        check_interval: int = 2
    ) -> Optional[Dict]:
        """
        Wait for an email with specific subject to arrive
        
        Args:
            subject: Email subject to search for
            recipient: Optional recipient email to filter by
            timeout: Maximum time to wait in seconds
            check_interval: Time between checks in seconds
        
        Returns:
            Message dict if found, None if timeout
        """
        start_time = time.time()
        
        while time.time() - start_time < timeout:
            # Get all messages and filter manually (more reliable)
            messages = self.get_messages(limit=100)
            
            for message in messages:
                # Check subject
                message_subject = message.get('Content', {}).get('Headers', {}).get('Subject', [''])[0]
                if subject.lower() in message_subject.lower():
                    # Check recipient if specified
                    if recipient:
                        to_field = message.get('Content', {}).get('Headers', {}).get('To', [''])[0]
                        if recipient.lower() in to_field.lower():
                            return message
                    else:
                        return message
            
            time.sleep(check_interval)
        
        return None
    
    def check_email_arrived(
        self,
        subject: str,
        recipient: Optional[str] = None
    ) -> bool:
        """
        Check if an email with specific subject has arrived
        
        Args:
            subject: Email subject to search for
            recipient: Optional recipient email to filter by
        
        Returns:
            True if email found, False otherwise
        """
        query = f'subject:"{subject}"'
        if recipient:
            query += f' to:"{recipient}"'
        
        messages = self.search_messages(query)
        return len(messages) > 0
    
    def get_email_content(self, message_id: str) -> Dict:
        """
        Get email content including subject, body, etc.
        
        Args:
            message_id: Message ID to fetch
        
        Returns:
            Dict with 'subject', 'from', 'to', 'html', 'text' keys
        """
        message = self.get_message_by_id(message_id)
        
        content = {
            'subject': message.get('Content', {}).get('Headers', {}).get('Subject', [''])[0],
            'from': message.get('Content', {}).get('Headers', {}).get('From', [''])[0],
            'to': message.get('Content', {}).get('Headers', {}).get('To', [''])[0],
            'html': None,
            'text': None
        }
        
        # Get body content
        for part in message.get('Content', {}).get('Parts', []):
            content_type = part.get('Headers', {}).get('Content-Type', [''])[0]
            body = part.get('Body', '')
            
            if 'text/html' in content_type:
                content['html'] = body
            elif 'text/plain' in content_type:
                content['text'] = body
        
        return content


# Convenience functions
def check_email_sent(
    subject: str,
    recipient: Optional[str] = None,
    host: str = "localhost",
    port: int = 8025
) -> bool:
    """Check if an email with subject was sent"""
    client = MailhogClient(host, port)
    return client.check_email_arrived(subject, recipient)


def wait_for_email(
    subject: str,
    recipient: Optional[str] = None,
    timeout: int = 30,
    host: str = "localhost",
    port: int = 8025
) -> Optional[Dict]:
    """Wait for an email to arrive"""
    client = MailhogClient(host, port)
    return client.wait_for_email(subject, recipient, timeout)


def clear_all_emails(host: str = "localhost", port: int = 8025) -> None:
    """Clear all emails from Mailhog"""
    client = MailhogClient(host, port)
    client.delete_all_messages()


if __name__ == "__main__":
    # Test the client
    client = MailhogClient()
    messages = client.get_messages()
    print(f"Found {len(messages)} messages")
    
    if messages:
        print(f"Latest message: {messages[0].get('Content', {}).get('Headers', {}).get('Subject')}")
