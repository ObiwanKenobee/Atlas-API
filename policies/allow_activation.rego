package atlas.policy

# Simple policy: allow activation only if requester has role "steward" or
# credential contains claim {"eligible": true}
default allow = false

allow {
  input.requester_role == "steward"
}

allow {
  some i
  input.credentials[i].claims.eligible == true
}
