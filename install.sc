echo Installing n1-unsubscribe to ~/.nylas/packages/n1-unsubscribe
rm -rf ~/.nylas/packages/n1-unsubscribe* &&
git archive -o ~/.nylas/packages/n1-unsubscribe.zip @ &&
pushd . &&
mkdir ~/.nylas/packages/n1-unsubscribe &&
cd ~/.nylas/packages/n1-unsubscribe &&
unzip ../n1-unsubscribe.zip &&
npm install &&
rm ../n1-unsubscribe.zip &&
popd &&
echo n1-unsubscribe installed successfully.
