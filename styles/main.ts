import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  flexstart: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  infoRow: {
    width: '80%',
    flexDirection: 'row',
    justifyContent: "flex-start",
    alignItems: 'center',
    borderWidth: 1,
    flexWrap: 'wrap'
  },
  rowSpacer: {
    flex: 1
  },
  thinBorder: {
    borderWidth: 1
  },
  inputWrapper: {
    width: '80%'
  },
  inputSpacer: {
    minHeight: 20
  },
  fullWidth: {
    width: '100%'
  },
  fullHeight: {
    height: '100%'
  },
  marginBottom: {
    marginBottom: 35
  },
  marginTop: {
    marginTop: 35
  },
  textAlignCenter: {
    textAlign: 'center'
  },
  inset: {
    marginHorizontal: 20,
    marginVertical: 10
  },
  clientHeaderAlignment: {
    marginLeft: 5
  },
  clientTitle: {
    flexDirection: 'row',
    alignItems: 'flex-end'
  },
  shMarginLeft: {
    marginLeft: 10
  },
  bigDivider: {
    height: 2,
    marginVertical: 25
  },
  clientMetadataSpacing: {
    marginHorizontal: 5
  }
});