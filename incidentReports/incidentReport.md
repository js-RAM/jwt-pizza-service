# Incident: 2025-12-03 13:30:00

## Summary

Between the hour of 1:17 pm and 1:58 pm on December 3rd, 51 users were unable to purchase pizzas. The event was triggered by an error with the Pizza Factory at 1:17 pm.

The event was detected through an employee observing the Grafana logs. The team started working on the event by {RESOLUTION ACTIONS TAKEN}. This significant incident affected 100% of users purchasing pizza while active

## Detection

The team detected this error at approximately 1:45 pm. They observed an uptick in pizza failures. Due to the low traffic at the time of the incident, the number of pizza failures did not trip the alerting system.
To ensure it properly trips the alerting system, we will lower the failure threshold.

## Impact

For 41 mins between 1:17 pm and 1:58 pm on 12/3/2025, users were unable to purchase pizzas. This incident affected all 51 customers who were attempting to purchase pizzas. No support tickets were submitted


## Timeline

All times are MDT

-_13:17_ - Pizza Factory began rejecting pizza purchases from the server
-_13:45_ - During a routine inspection of the Grafana metrics, the DevOps team noticed an uptick in pizza failures
-_13:50_ - Further analysis revealed that all purchases since 13:17 had failed
-_13:57_ - An inspection of the logs revealed the request to the factory was failing.
-_13:58_ - DevOps followed the support url provided by the factory in its fail message. By following the link, the factory was able to reauthenticate our server and pizza purchases no longer failed. Issue resolved

## Response

Joshua Swartz noticed an uptick in pizza failures at 1:45 pm MDT and began investing it through the Grafana logs. They were able to resolve the issue


## Root cause

An error with the Pizza Factory caused the order failures. The Pizza Factory was not authenticating purchases from our website until a link it provided was followed. We will need to contact
the factory to ensure this will not happen again. We also need to decrease the threshold in our alerting system so that we can catch similar incidents at a faster rate.

## Resolution

The failed response from the pizza factory was captured by Grafana. The Pizza Factory provided a url to go to to resolve the issue in each failed response. By following the link, the DevOps team was able to
fix the issue and get Pizza purchases working again. This could have been fixed faster if the alerting system had properly caught the issue.

## Prevention

No previous incidents have had this error. We will contact the Pizza Factory and improve our alerting system to ensure this will not happen again. 
The alerting system was designed to go off if there were more than 3 purchase failures in a minute. At the time of the incident, there was only an 
average of 1-2 pizza purchases per minute and therefore it was not enough to trigger the system. We will switch to a percentage failure based alert

## Action items

1. Change the system to alert when more than 5% of purchases within a minute.
