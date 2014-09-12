New dashboard for OpenStack using angularjs talking directly to the APIs.

This is currently *very* raw, proof-of-concept. You can authenticate and
hit *one* nova API call using those credentials.


To set up:

  mkvirtualenv angboard
  pip install -r requirements.txt

And then:

  ./run <URL to keystone API>

For example, given devstack on 10.0.0.1:

  ./run http://10.0.0.1:5000/v2.0
