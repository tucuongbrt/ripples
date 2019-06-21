# WGViewer/Ripples


## Iridium tests description:
### Each of the following tests should be executed from a browser and from Neptus:
- Send a plan to a vehicle without any plan assigned.
- Send a plan to a vehicle that is already executing a plan.
- Update the position of a waypoint that has not been reached yet.
- Delete a waypoint that has not been reached yet.
- Update the ETA of a waypoint that has not been reached yet.

## Other tests:

### Usability tests (should be run in a smart phone browser):
- Create a new plan and send it to a vehicle.
- Wait for the plan to generate temperature profiles and open one of them.
- Use the slider to see previous and future positions of the vehicles and AIS ships.
- Change the position of a waypoint that has not been reached yet.
- Delete a waypoint that has not been reached yet.

### Risk analysis tests:
- Open the risk analysis tool and submit your phone number in the format: +351xxxxxxxxx
- Open ripples and create a new plan that should have collisions with AIS ships and send it to a vehicle.
- Check on the risk analysis tool that collisions are being predicted correctly.