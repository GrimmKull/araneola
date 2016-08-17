# Testing procedure for Reticulum

create()

connect()

register()

call()




plotData()

calcPhoneStates()

a_states

b_states

parseCallDuration()

JSON.stringify(calls)

calcMeanSdVar(calls)


var t = [a_reg_401_reqs, a_reg_200_reqs, b_reg_401_reqs, b_reg_200_reqs,a_inv_reqs,b_inv_reqs,a_bye_reqs,b_bye_reqs];

for (var i = 0; i < t.length; i++)
   console.log(JSON.stringify(t[i]));




var t = [a_reg_401_history, a_reg_200_history, b_reg_401_history, b_reg_200_history, a_inv_history, b_inv_history, a_bye_history, b_bye_history];

for (var i = 0; i < t.length; i++)
	console.log(JSON.stringify(t[i]));





